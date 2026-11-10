/**
 * محرّك الاستيراد المجمّع للمنهاج.
 *
 * يقبل صفوفًا مسطّحة (CSV) أو بنية JSON متداخلة، يتحقق من كل صف، يمنع التكرار
 * اعتمادًا على المسار الموحّد، ثم يطبّق التغييرات دفعة واحدة.
 * التشغيل التجريبي (dry-run) والتنفيذ الفعلي يستخدمان نفس المسار البرمجي،
 * لذلك ما تراه في المعاينة هو ما سيُطبّق تمامًا.
 */
import { parseCsv, toRecords } from './csv';
import { gradeTitle, stageOf } from './catalog';
import { normalizeKey, stableId } from './keys';
import type {
  CurriculumGrade,
  CurriculumLesson,
  CurriculumQuestion,
  CurriculumSemester,
  CurriculumState,
  CurriculumSubject,
  CurriculumUnit,
  QuestionDifficulty,
  QuestionKind,
  SemesterNumber,
} from './types';
import { TRUE_FALSE_OPTIONS } from './types';

export type ImportMode = 'skip' | 'update';
export type ImportFormat = 'csv' | 'json';

export interface ImportIssue {
  row: number;
  field: string;
  message: string;
}

export interface ImportCounts {
  grades: number;
  subjects: number;
  units: number;
  lessons: number;
  questions: number;
}

export interface SkippedRow {
  row: number;
  path: string;
  reason: string;
}

export interface ImportPlan {
  rows: number;
  creates: ImportCounts;
  updates: ImportCounts;
  skipped: SkippedRow[];
  issues: ImportIssue[];
  canApply: boolean;
}

export interface ImportResult {
  state: CurriculumState;
  plan: ImportPlan;
}

export interface ParsedImport {
  rows: Array<Record<string, string>>;
  issues: ImportIssue[];
}

const FIELD_ALIASES: Record<string, string[]> = {
  grade: ['grade', 'grade_number', 'gradenumber', 'الصف', 'صف', 'رقم الصف'],
  subject: ['subject', 'subject_title', 'المادة', 'مادة', 'اسم المادة'],
  stream: ['stream', 'track', 'الفرع', 'فرع'],
  semester: ['semester', 'term', 'semester_number', 'الفصل', 'الفصل الدراسي'],
  unit: ['unit', 'unit_title', 'الوحدة', 'وحدة', 'اسم الوحدة'],
  lesson: ['lesson', 'lesson_title', 'الدرس', 'درس', 'اسم الدرس'],
  lessonObjective: ['lesson_objective', 'objective', 'هدف الدرس', 'الهدف'],
  lessonExplanation: ['lesson_explanation', 'lesson_body', 'شرح الدرس'],
  page: ['page', 'lesson_page', 'الصفحة', 'صفحة'],
  type: ['type', 'question_type', 'kind', 'النوع', 'نوع السؤال'],
  prompt: ['prompt', 'question', 'question_text', 'السؤال', 'نص السؤال'],
  option1: ['option1', 'option_1', 'option_a', 'a', 'الخيار 1', 'الخيار الأول', 'خيار1'],
  option2: ['option2', 'option_2', 'option_b', 'b', 'الخيار 2', 'الخيار الثاني', 'خيار2'],
  option3: ['option3', 'option_3', 'option_c', 'c', 'الخيار 3', 'الخيار الثالث', 'خيار3'],
  option4: ['option4', 'option_4', 'option_d', 'd', 'الخيار 4', 'الخيار الرابع', 'خيار4'],
  correct: ['correct', 'correct_option', 'answer', 'correctoption', 'الإجابة', 'الإجابة الصحيحة', 'الجواب'],
  explanation: ['explanation', 'answer_explanation', 'الشرح', 'التفسير', 'شرح الإجابة'],
  difficulty: ['difficulty', 'level', 'الصعوبة', 'المستوى', 'مستوى الصعوبة'],
  source: ['source', 'source_reference', 'reference', 'المصدر', 'المرجع'],
};

const ALIAS_LOOKUP = (() => {
  const map = new Map<string, string>();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    map.set(normalizeKey(field), field);
    aliases.forEach((alias) => map.set(normalizeKey(alias), field));
  }
  return map;
})();

function canonicalize(record: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    const field = ALIAS_LOOKUP.get(normalizeKey(key));
    if (!field) continue;
    if (result[field] === undefined || result[field] === '') result[field] = String(value ?? '').trim();
  }
  return result;
}

const ARABIC_DIGITS: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

function latinDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => ARABIC_DIGITS[digit] ?? digit);
}

export function parseGrade(value: string): number | null {
  const text = normalizeKey(latinDigits(value));
  if (!text) return null;
  const digits = text.match(/\d{1,2}/);
  if (digits) {
    const number = Number(digits[0]);
    return number >= 1 && number <= 12 ? number : null;
  }
  const ordinal = ['الاول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];
  const index = ordinal.findIndex((entry) => text.includes(normalizeKey(entry)));
  return index === -1 ? null : index + 1;
}

export function parseSemester(value: string): SemesterNumber | null {
  const text = normalizeKey(latinDigits(value));
  if (!text) return null;
  if (text.includes('2') || text.includes('ثاني')) return 2;
  if (text.includes('1') || text.includes('اول')) return 1;
  return null;
}

export function parseDifficulty(value: string): QuestionDifficulty | null {
  const text = normalizeKey(value);
  if (!text) return null;
  if (['easy', 'سهل', 'سهله'].includes(text)) return 'easy';
  if (['medium', 'متوسط', 'متوسطه'].includes(text)) return 'medium';
  if (['hard', 'صعب', 'متقدم', 'متقدمه'].includes(text)) return 'hard';
  return null;
}

export function parseKind(value: string): QuestionKind | null {
  const text = normalizeKey(value);
  if (!text) return null;
  if (text.includes('true') || text.includes('صح') || text.includes('خطا')) return 'true_false';
  if (text.includes('mcq') || text.includes('multi') || text.includes('اختيار')) return 'mcq';
  return null;
}

function parseCorrect(raw: string, options: string[], kind: QuestionKind): number | null {
  const text = latinDigits(String(raw ?? '')).trim();
  if (!text) return null;
  if (kind === 'true_false') {
    const normalized = normalizeKey(text);
    if (['صح', 'صحيح', 'true', '1', 'نعم'].includes(normalized)) return 0;
    if (['خطا', 'خطأ', 'false', '0', 'لا'].includes(normalized)) return 1;
  }
  const asNumber = Number(text);
  if (Number.isFinite(asNumber)) {
    if (asNumber >= 1 && asNumber <= options.length) return asNumber - 1;
    if (asNumber === 0) return 0;
  }
  const optionIndex = options.findIndex((option) => normalizeKey(option) === normalizeKey(text));
  return optionIndex === -1 ? null : optionIndex;
}

function collectOptions(row: Record<string, string>): string[] {
  const options = [row.option1, row.option2, row.option3, row.option4]
    .map((option) => String(option ?? '').trim())
    .filter((option) => option !== '');
  return options;
}

function emptyCounts(): ImportCounts {
  return { grades: 0, subjects: 0, units: 0, lessons: 0, questions: 0 };
}

function cloneState(state: CurriculumState): CurriculumState {
  return JSON.parse(JSON.stringify(state)) as CurriculumState;
}

function ensureGrade(state: CurriculumState, gradeNumber: number): { grade: CurriculumGrade; created: boolean } {
  const existing = state.grades.find((grade) => grade.gradeNumber === gradeNumber);
  if (existing) return { grade: existing, created: false };
  const grade: CurriculumGrade = {
    gradeNumber,
    title: gradeTitle(gradeNumber),
    stage: stageOf(gradeNumber),
    subjects: [],
  };
  state.grades.push(grade);
  state.grades.sort((a, b) => a.gradeNumber - b.gradeNumber);
  return { grade, created: true };
}

function ensureSubject(
  grade: CurriculumGrade,
  title: string,
  stream: string,
): { subject: CurriculumSubject; created: boolean } {
  const existing = grade.subjects.find(
    (subject) => normalizeKey(subject.title) === normalizeKey(title) && normalizeKey(subject.stream) === normalizeKey(stream),
  );
  if (existing) return { subject: existing, created: false };
  const subject: CurriculumSubject = {
    id: stableId('sub', `${grade.gradeNumber}|${stream}|${title}`),
    title,
    stream,
    note: 'أُضيفت عبر الاستيراد المجمّع.',
    semesters: [
      { number: 1, units: [] },
      { number: 2, units: [] },
    ],
  };
  grade.subjects.push(subject);
  return { subject, created: true };
}

function ensureSemester(subject: CurriculumSubject, number: SemesterNumber): CurriculumSemester {
  let semester = subject.semesters.find((entry) => entry.number === number);
  if (!semester) {
    semester = { number, units: [] };
    subject.semesters.push(semester);
    subject.semesters.sort((a, b) => a.number - b.number);
  }
  return semester;
}

function ensureUnit(semester: CurriculumSemester, title: string): { unit: CurriculumUnit; created: boolean } {
  const existing = semester.units.find((unit) => normalizeKey(unit.title) === normalizeKey(title));
  if (existing) return { unit: existing, created: false };
  const unit: CurriculumUnit = {
    id: stableId('u', `${semester.number}|${title}`),
    title,
    lessons: [],
  };
  semester.units.push(unit);
  return { unit, created: true };
}

function ensureLesson(
  unit: CurriculumUnit,
  title: string,
  row: Record<string, string>,
): { lesson: CurriculumLesson; created: boolean } {
  const existing = unit.lessons.find((lesson) => normalizeKey(lesson.title) === normalizeKey(title));
  if (existing) return { lesson: existing, created: false };
  const lesson: CurriculumLesson = {
    id: stableId('l', `${unit.id}|${title}`),
    title,
    objective: String(row.lessonObjective ?? '').trim(),
    explanation: String(row.lessonExplanation ?? '').trim(),
    page: String(row.page ?? '').trim(),
    source: String(row.source ?? '').trim(),
    questions: [],
  };
  unit.lessons.push(lesson);
  return { lesson, created: true };
}

interface RowContext {
  gradeNumber: number;
  subject: string;
  stream: string;
  semester: SemesterNumber;
  unit: string;
  lesson: string;
}

function readContext(row: Record<string, string>, issues: ImportIssue[], rowNumber: number): RowContext | null {
  let valid = true;
  const gradeNumber = parseGrade(row.grade ?? '');
  if (gradeNumber === null) {
    issues.push({ row: rowNumber, field: 'grade', message: 'الصف مطلوب ويجب أن يكون بين 1 و12.' });
    valid = false;
  }
  const subject = String(row.subject ?? '').trim();
  if (!subject) {
    issues.push({ row: rowNumber, field: 'subject', message: 'اسم المادة مطلوب.' });
    valid = false;
  }
  const semester = parseSemester(row.semester ?? '');
  if (semester === null) {
    issues.push({ row: rowNumber, field: 'semester', message: 'الفصل الدراسي مطلوب (1 أو 2).' });
    valid = false;
  }
  const unit = String(row.unit ?? '').trim();
  if (!unit) {
    issues.push({ row: rowNumber, field: 'unit', message: 'اسم الوحدة مطلوب.' });
    valid = false;
  }
  const lesson = String(row.lesson ?? '').trim();
  if (!lesson) {
    issues.push({ row: rowNumber, field: 'lesson', message: 'اسم الدرس مطلوب.' });
    valid = false;
  }
  if (!valid || gradeNumber === null || semester === null) return null;
  return {
    gradeNumber,
    subject,
    stream: String(row.stream ?? '').trim(),
    semester,
    unit,
    lesson,
  };
}

/**
 * يطبّق الصفوف على نسخة من الحالة ويعيد الحالة الجديدة مع خطة تفصيلية.
 * لا يُعدّل الحالة الأصلية أبدًا (معاملة واحدة).
 */
export function runImport(
  base: CurriculumState,
  rows: Array<Record<string, string>>,
  mode: ImportMode,
): ImportResult {
  const state = cloneState(base);
  const plan: ImportPlan = {
    rows: rows.length,
    creates: emptyCounts(),
    updates: emptyCounts(),
    skipped: [],
    issues: [],
    canApply: false,
  };

  rows.forEach((raw, index) => {
    const rowNumber = index + 1;
    const row = canonicalize(raw);
    const hasPrompt = String(row.prompt ?? '').trim() !== '';
    const hasType = String(row.type ?? '').trim() !== '';

    const context = readContext(row, plan.issues, rowNumber);
    if (!context) return;

    // صف هيكلي: وحدة/درس بلا سؤال — مسموح لاستيراد هيكل الكتاب أولًا.
    const isStructureRow = !hasPrompt && !hasType;

    let kind: QuestionKind = 'mcq';
    let options: string[] = [];
    let correctOption = 0;
    if (!isStructureRow) {
      const parsedKind = parseKind(row.type ?? '');
      if (!parsedKind) {
        plan.issues.push({ row: rowNumber, field: 'type', message: 'نوع السؤال يجب أن يكون mcq أو true_false.' });
        return;
      }
      kind = parsedKind;
      options = kind === 'true_false' ? [...TRUE_FALSE_OPTIONS] : collectOptions(row);
      if (options.length < 2) {
        plan.issues.push({ row: rowNumber, field: 'options', message: 'يجب توفير خيارين على الأقل للسؤال.' });
        return;
      }
      const parsedCorrect = parseCorrect(row.correct ?? '', options, kind);
      if (parsedCorrect === null) {
        plan.issues.push({ row: rowNumber, field: 'correct', message: 'الإجابة الصحيحة غير محددة أو خارج نطاق الخيارات.' });
        return;
      }
      correctOption = parsedCorrect;
      if (!String(row.explanation ?? '').trim()) {
        plan.issues.push({ row: rowNumber, field: 'explanation', message: 'شرح الإجابة مطلوب لكل سؤال.' });
        return;
      }
      if (!parseDifficulty(row.difficulty ?? '')) {
        plan.issues.push({ row: rowNumber, field: 'difficulty', message: 'مستوى الصعوبة مطلوب: سهل أو متوسط أو صعب.' });
        return;
      }
      if (!String(row.source ?? '').trim()) {
        plan.issues.push({ row: rowNumber, field: 'source', message: 'مرجع المصدر مطلوب للتأكد من مطابقة الكتاب.' });
        return;
      }
    }

    const { grade, created: gradeCreated } = ensureGrade(state, context.gradeNumber);
    if (gradeCreated) plan.creates.grades += 1;

    const { subject, created: subjectCreated } = ensureSubject(grade, context.subject, context.stream);
    if (subjectCreated) plan.creates.subjects += 1;

    const semester = ensureSemester(subject, context.semester);
    const { unit, created: unitCreated } = ensureUnit(semester, context.unit);
    if (unitCreated) plan.creates.units += 1;

    const { lesson, created: lessonCreated } = ensureLesson(unit, context.lesson, row);
    if (lessonCreated) plan.creates.lessons += 1;
    else if (!isStructureRow) {
      const objective = String(row.lessonObjective ?? '').trim();
      const explanation = String(row.lessonExplanation ?? '').trim();
      const page = String(row.page ?? '').trim();
      let changed = false;
      if (objective && !lesson.objective) { lesson.objective = objective; changed = true; }
      if (explanation && !lesson.explanation) { lesson.explanation = explanation; changed = true; }
      if (page && !lesson.page) { lesson.page = page; changed = true; }
      if (changed && mode === 'update') plan.updates.lessons += 1;
    }

    if (isStructureRow) return;

    const prompt = String(row.prompt ?? '').trim();
    const pathLabel = `${gradeTitle(context.gradeNumber)} › ${context.subject} › ${context.unit} › ${context.lesson}`;
    const existing = lesson.questions.find((question) => normalizeKey(question.prompt) === normalizeKey(prompt));
    if (existing) {
      if (mode === 'skip') {
        plan.skipped.push({ row: rowNumber, path: pathLabel, reason: 'سؤال مكرر في الدرس نفسه — تم تجاهله.' });
        return;
      }
      existing.kind = kind;
      existing.options = options;
      existing.correctOption = correctOption;
      existing.explanation = String(row.explanation ?? '').trim();
      existing.difficulty = parseDifficulty(row.difficulty ?? '') ?? existing.difficulty;
      existing.source = String(row.source ?? '').trim();
      plan.updates.questions += 1;
      return;
    }

    const question: CurriculumQuestion = {
      id: stableId('q', `${lesson.id}|${prompt}`),
      kind,
      prompt,
      options,
      correctOption,
      explanation: String(row.explanation ?? '').trim(),
      difficulty: parseDifficulty(row.difficulty ?? '') ?? 'medium',
      source: String(row.source ?? '').trim(),
    };
    lesson.questions.push(question);
    plan.creates.questions += 1;
  });

  plan.canApply = plan.issues.length === 0;
  state.updatedAt = new Date().toISOString();
  return { state, plan };
}

/** يحوّل بنية JSON متداخلة إلى صفوف مسطّحة، أو يمرّر مصفوفة صفوف كما هي. */
export function rowsFromJson(value: unknown, issues: ImportIssue[] = []): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = [];
  if (!value) {
    issues.push({ row: 0, field: 'json', message: 'الملف فارغ أو غير صالح.' });
    return rows;
  }

  const asString = (input: unknown): string =>
    input === null || input === undefined ? '' : String(input);

  if (Array.isArray(value) && value.length && typeof value[0] === 'object' && value[0] !== null) {
    const first = value[0] as Record<string, unknown>;
    const looksFlat = 'prompt' in first || 'question' in first || 'السؤال' in first || 'unit' in first || 'الوحدة' in first;
    if (looksFlat) {
      value.forEach((entry) => {
        const record: Record<string, string> = {};
        Object.entries(entry as Record<string, unknown>).forEach(([key, cell]) => {
          record[key] = asString(cell);
        });
        rows.push(record);
      });
      return rows;
    }
  }

  const grades = Array.isArray(value) ? value : [value];
  grades.forEach((gradeRaw) => {
    const grade = gradeRaw as Record<string, unknown>;
    const gradeNumber = asString(grade.grade ?? grade.gradeNumber ?? grade.number ?? grade['الصف']);
    const subjects = (grade.subjects ?? grade['المواد'] ?? []) as unknown[];
    (Array.isArray(subjects) ? subjects : []).forEach((subjectRaw) => {
      const subject = subjectRaw as Record<string, unknown>;
      const subjectTitle = asString(subject.title ?? subject.name ?? subject['المادة']);
      const stream = asString(subject.stream ?? subject['الفرع']);
      const semesters = (subject.semesters ?? subject['الفصول'] ?? []) as unknown[];
      (Array.isArray(semesters) ? semesters : []).forEach((semesterRaw, semesterIndex) => {
        const semester = semesterRaw as Record<string, unknown>;
        const semesterNumber = asString(semester.number ?? semester.semester ?? semesterIndex + 1);
        const units = (semester.units ?? semester['الوحدات'] ?? []) as unknown[];
        (Array.isArray(units) ? units : []).forEach((unitRaw) => {
          const unit = unitRaw as Record<string, unknown>;
          const unitTitle = asString(unit.title ?? unit.name ?? unit['الوحدة']);
          const lessons = (unit.lessons ?? unit['الدروس'] ?? []) as unknown[];
          (Array.isArray(lessons) ? lessons : []).forEach((lessonRaw) => {
            const lesson = lessonRaw as Record<string, unknown>;
            const lessonTitle = asString(lesson.title ?? lesson.name ?? lesson['الدرس']);
            const base = {
              grade: gradeNumber,
              subject: subjectTitle,
              stream,
              semester: semesterNumber,
              unit: unitTitle,
              lesson: lessonTitle,
              lessonObjective: asString(lesson.objective ?? lesson['الهدف']),
              lessonExplanation: asString(lesson.explanation ?? lesson['الشرح']),
              page: asString(lesson.page ?? lesson['الصفحة']),
            };
            const questions = (lesson.questions ?? lesson['الأسئلة'] ?? []) as unknown[];
            const questionList = Array.isArray(questions) ? questions : [];
            if (!questionList.length) {
              rows.push({ ...base });
              return;
            }
            questionList.forEach((questionRaw) => {
              const question = questionRaw as Record<string, unknown>;
              const options = (question.options ?? []) as unknown[];
              const optionList = Array.isArray(options) ? options.map((option) => asString(option)) : [];
              rows.push({
                ...base,
                type: asString(question.kind ?? question.type ?? 'mcq'),
                prompt: asString(question.prompt ?? question.question ?? question['السؤال']),
                option1: optionList[0] ?? '',
                option2: optionList[1] ?? '',
                option3: optionList[2] ?? '',
                option4: optionList[3] ?? '',
                correct: asString(question.correctOption ?? question.correct ?? question['الإجابة']),
                explanation: asString(question.explanation ?? question['الشرح']),
                difficulty: asString(question.difficulty ?? question.level ?? question['الصعوبة']),
                source: asString(question.source ?? lesson.source ?? lesson['المصدر']),
              });
            });
          });
        });
      });
    });
  });

  if (!rows.length) {
    issues.push({ row: 0, field: 'json', message: 'لم يُعثر على أي صفوف منهاج داخل ملف JSON.' });
  }
  return rows;
}

/** يقرأ نص CSV أو JSON ويعيد الصفوف المسطّحة. */
export function parseImportText(text: string, format: ImportFormat): ParsedImport {
  const issues: ImportIssue[] = [];
  const trimmed = text.trim();
  if (!trimmed) return { rows: [], issues: [{ row: 0, field: 'file', message: 'الملف فارغ.' }] };

  if (format === 'json') {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return { rows: rowsFromJson(parsed, issues), issues };
    } catch (error) {
      return {
        rows: [],
        issues: [{ row: 0, field: 'json', message: `JSON غير صالح: ${(error as Error).message}` }],
      };
    }
  }

  const table = parseCsv(trimmed);
  if (!table.headers.length) return { rows: [], issues: [{ row: 0, field: 'file', message: 'لم يُعثر على عناوين أعمدة.' }] };
  const recognized = table.headers.filter((header) => ALIAS_LOOKUP.has(normalizeKey(header)));
  if (!recognized.length) {
    issues.push({
      row: 0,
      field: 'headers',
      message: 'لم يتم التعرف على أي عمود معروف. استخدم القالب المتوفر لضمان صحة العناوين.',
    });
  }
  return { rows: toRecords(table), issues };
}

/**
 * سجل الكتب المدرسية الرسمية لكل صف/مادة/فصل، مع حالة مصدر واضحة لكل كتاب.
 *
 * قواعد هذا الملف:
 * - لا يحتوي أي وحدات أو دروس أو أسئلة مُخترعة. المحتوى (الوحدات/الدروس/الأسئلة)
 *   يُقرأ فقط من الكتب المستوردة فعليًا عبر data/math-grades.ts وcurriculum-books.ts.
 * - كل مادة في كل صف لها كتابان: الفصل الدراسي الأول والثاني. ما لم يُستورد محتواه
 *   يظهر بحالة «بانتظار الاستيراد» مع رابط صفحة الكتب الرسمية للمركز الوطني لتطوير المناهج.
 * - أسماء الكتب مصوغة من تسمية المركز الوطني: «كتاب الطالب» + اسم المادة + الفصل،
 *   ولا تُنسب أي وحدات أو دروس إلى كتاب لم يُستورد.
 */
import {
  ALL_LESSONS,
  ALL_QUESTIONS,
  ALL_SUBJECTS,
  ALL_UNITS,
  type SemesterNumber,
} from './curriculum-books';
import { IMPORTED_OUTLINES, outlineFor, outlineStats } from '../data/imported-outlines';

/** صفحة الكتب المدرسية الرسمية (المركز الوطني لتطوير المناهج). */
export const OFFICIAL_TEXTBOOK_INDEX = 'https://www.nccd.gov.jo/Ar/Pages/textbooks';

/**
 * صفحات الكتب الرسمية التي تأكّد وجودها على موقع المركز الوطني لتطوير المناهج.
 * أي صف بلا صفحة مؤكدة يُعاد إلى فهرس الكتب الرسمي بدل اختراع رابط.
 */
const OBSERVED_GRADE_PAGES: Record<number, string> = {
  1: 'https://www.nccd.gov.jo/ar/pages/TextBooksGrade/68',
  2: 'https://www.nccd.gov.jo/ar/pages/TextBooksGrade/69',
  3: 'https://www.nccd.gov.jo/ar/pages/TextBooksGrade/70',
  11: 'https://nccd.gov.jo/ar/pages/TextBooksGrade/117',
  12: 'https://nccd.gov.jo/ar/pages/TextBooksGrade/143',
};

export function gradeSourcePage(gradeNumber: number): string {
  return OBSERVED_GRADE_PAGES[gradeNumber] ?? OFFICIAL_TEXTBOOK_INDEX;
}

export type BookStatus = 'linked' | 'outline-imported' | 'outline-unverified' | 'awaiting-import';

export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  linked: 'مربوط',
  'outline-imported': 'وحدات ودروس مستوردة',
  'outline-unverified': 'وحدات مستوردة (الفصل غير موثق)',
  'awaiting-import': 'بانتظار الاستيراد',
};

export interface OfficialBook {
  /** معرّف ثابت: <subjectId>-<semester>. */
  key: string;
  gradeNumber: number;
  subjectId: number;
  subjectTitle: string;
  stream: string;
  semester: SemesterNumber;
  title: string;
  status: BookStatus;
  units: number;
  lessons: number;
  questions: number;
  /** صفحة المصدر الرسمي لهذا الصف. */
  sourcePage: string;
  /** رابط مصدر الوحدات/الدروس المستوردة (إن وُجدت). */
  outlineSourceUrl?: string;
  /** الدليل على ترتيب الوحدات وتقسيم الفصل الدراسي. */
  outlineVerifiedBy?: string;
}

const unitsBySubject = new Map<number, typeof ALL_UNITS>();
const lessonsBySubject = new Map<number, typeof ALL_LESSONS>();
const questionsByLesson = new Map<number, number>();

for (const unit of ALL_UNITS) {
  const list = unitsBySubject.get(unit.subjectId) ?? [];
  unitsBySubject.set(unit.subjectId, [...list, unit]);
}
for (const lesson of ALL_LESSONS) {
  const list = lessonsBySubject.get(lesson.subjectId) ?? [];
  lessonsBySubject.set(lesson.subjectId, [...list, lesson]);
  questionsByLesson.set(lesson.id, ALL_QUESTIONS.filter((q) => q.lessonId === lesson.id).length);
}

function buildBooks(): OfficialBook[] {
  const books: OfficialBook[] = [];
  for (const subject of ALL_SUBJECTS) {
    const subjectUnits = unitsBySubject.get(subject.id) ?? [];
    const subjectLessons = lessonsBySubject.get(subject.id) ?? [];
    for (const semester of [1, 2] as const) {
      const semesterUnits = subjectUnits.filter((unit) => unit.semester === semester);
      const semesterLessons = subjectLessons.filter((lesson) => lesson.semester === semester);
      const questions = semesterLessons.reduce(
        (total, lesson) => total + (questionsByLesson.get(lesson.id) ?? 0),
        0,
      );
      // وحدات ودروس الكتاب المستوردة من مصدر أردني فعلي (بلا أسئلة بعد).
      const outline = outlineFor(subject.gradeNumber, subject.title, semester);
      // إحصاءات الوحدات تُنسب إلى كتاب الفصل فقط إذا أثبت المصدر تقسيم الفصل الدراسي.
      const outlineCounts = outline && outline.semesterVerified ? outlineStats(outline) : null;
      const hasContent = semesterUnits.length > 0;
      const status: BookStatus = hasContent
        ? 'linked'
        : outlineCounts
          ? 'outline-imported'
          : outline
            ? 'outline-unverified'
            : 'awaiting-import';
      books.push({
        key: `${subject.id}-${semester}`,
        gradeNumber: subject.gradeNumber,
        subjectId: subject.id,
        subjectTitle: subject.title,
        stream: subject.stream,
        semester,
        title: `كتاب الطالب — ${subject.title} — الفصل ${semester === 1 ? 'الأول' : 'الثاني'}`,
        status,
        units: hasContent ? semesterUnits.length : (outlineCounts?.units ?? 0),
        lessons: hasContent ? semesterLessons.length : (outlineCounts?.lessons ?? 0),
        questions,
        sourcePage: gradeSourcePage(subject.gradeNumber),
        outlineSourceUrl: outline?.sourceUrl,
        outlineVerifiedBy: outline?.verifiedBy,
      });
    }
  }
  return books;
}

export const OFFICIAL_BOOKS: readonly OfficialBook[] = buildBooks();

const booksBySubject = new Map<number, OfficialBook[]>();
for (const book of OFFICIAL_BOOKS) {
  const list = booksBySubject.get(book.subjectId) ?? [];
  booksBySubject.set(book.subjectId, [...list, book]);
}

/** كتابا الفصلين لمادة واحدة، مرتّبين بالفصل الدراسي. */
export function booksOfSubject(subjectId: number): OfficialBook[] {
  return booksBySubject.get(subjectId) ?? [];
}

export function bookOf(subjectId: number, semester: SemesterNumber): OfficialBook | undefined {
  return booksOfSubject(subjectId).find((book) => book.semester === semester);
}

export interface GradeCompletion {
  gradeNumber: number;
  title: string;
  stage: string;
  subjects: number;
  books: number;
  booksLinked: number;
  booksPending: number;
  units: number;
  lessons: number;
  questions: number;
  sourcePage: string;
}

export interface CurriculumCompletion {
  grades: GradeCompletion[];
  totals: Omit<GradeCompletion, 'gradeNumber' | 'title' | 'stage' | 'sourcePage'>;
}

/** ملخّص اكتمال الكتب لكل صف: كم كتابًا مربوط بمحتواه وكم بانتظار الاستيراد. */
export function curriculumCompletion(): CurriculumCompletion {
  const grades: GradeCompletion[] = [];
  const gradeNumbers = Array.from(new Set(ALL_SUBJECTS.map((subject) => subject.gradeNumber))).sort(
    (a, b) => a - b,
  );
  for (const gradeNumber of gradeNumbers) {
    const gradeBooks = OFFICIAL_BOOKS.filter((book) => book.gradeNumber === gradeNumber);
    const subjects = ALL_SUBJECTS.filter((subject) => subject.gradeNumber === gradeNumber);
    grades.push({
      gradeNumber,
      title: `الصف ${gradeNumber}`,
      stage: subjects[0]?.stream ?? '',
      subjects: subjects.length,
      books: gradeBooks.length,
      booksLinked: gradeBooks.filter((book) => book.status === 'linked').length,
      booksPending: gradeBooks.filter((book) => book.status !== 'linked').length,
      units: gradeBooks.reduce((total, book) => total + book.units, 0),
      lessons: gradeBooks.reduce((total, book) => total + book.lessons, 0),
      questions: gradeBooks.reduce((total, book) => total + book.questions, 0),
      sourcePage: gradeSourcePage(gradeNumber),
    });
  }
  const totals = grades.reduce(
    (acc, grade) => ({
      subjects: acc.subjects + grade.subjects,
      books: acc.books + grade.books,
      booksLinked: acc.booksLinked + grade.booksLinked,
      booksPending: acc.booksPending + grade.booksPending,
      units: acc.units + grade.units,
      lessons: acc.lessons + grade.lessons,
      questions: acc.questions + grade.questions,
    }),
    { subjects: 0, books: 0, booksLinked: 0, booksPending: 0, units: 0, lessons: 0, questions: 0 },
  );
  return { grades, totals };
}

export interface DuplicateIssue {
  kind: 'book' | 'subject' | 'unit' | 'lesson';
  detail: string;
}

/**
 * فحص عدم التكرار: لا كتب مكرّرة، ولا مواد مكرّرة داخل الصف،
 * ولا وحدات أو دروس مكرّرة داخل المادة نفسها.
 */
export function duplicateIssues(): DuplicateIssue[] {
  const issues: DuplicateIssue[] = [];
  const seenKeys = new Set<string>();
  for (const book of OFFICIAL_BOOKS) {
    if (seenKeys.has(book.key)) issues.push({ kind: 'book', detail: `كتاب مكرّر: ${book.key}` });
    seenKeys.add(book.key);
  }
  for (const gradeNumber of new Set(ALL_SUBJECTS.map((subject) => subject.gradeNumber))) {
    const seen = new Set<string>();
    for (const subject of ALL_SUBJECTS.filter((s) => s.gradeNumber === gradeNumber)) {
      // العنوان وحده لا يكفي: الصفان 11 و12 لهما مسارات مختلفة (علمي/أدبي/مهني)
      // تظهر فيها المادة نفسها بعنوان واحد، وهي مواد مستقلة لا تكرار.
      const key = `${subject.stream.trim()}-${subject.title.trim()}`;
      if (seen.has(key)) {
        issues.push({
          kind: 'subject',
          detail: `مادة مكرّرة في الصف ${gradeNumber} (${subject.stream}): ${subject.title}`,
        });
      }
      seen.add(key);
    }
  }
  const seenUnits = new Set<string>();
  for (const unit of ALL_UNITS) {
    const key = `${unit.subjectId}-${unit.semester}-${unit.unit.title.trim()}`;
    if (seenUnits.has(key)) {
      issues.push({ kind: 'unit', detail: `وحدة مكرّرة: ${unit.unit.title}` });
    }
    seenUnits.add(key);
  }
  const seenLessons = new Set<string>();
  for (const lesson of ALL_LESSONS) {
    const key = `${lesson.subjectId}-${lesson.semester}-${lesson.lesson.title.trim()}`;
    if (seenLessons.has(key)) {
      issues.push({ kind: 'lesson', detail: `درس مكرّر: ${lesson.lesson.title}` });
    }
    seenLessons.add(key);
  }
  // فحص الوحدات والدروس المستوردة: لا تكرار داخل الكتاب، ولا كتاب بلا مادة مطابقة.
  for (const outline of IMPORTED_OUTLINES) {
    const subject = ALL_SUBJECTS.find(
      (item) =>
        item.gradeNumber === outline.gradeNumber &&
        item.title.trim() === outline.subjectTitle.trim(),
    );
    if (!subject) {
      issues.push({
        kind: 'book',
        detail: `كتاب مستورد بلا مادة مطابقة: ${outline.key}`,
      });
    }
    const seenOutlineUnits = new Set<string>();
    for (const unit of outline.units) {
      const unitKey = `${outline.key}-${unit.title.trim()}`;
      if (seenOutlineUnits.has(unitKey)) {
        issues.push({ kind: 'unit', detail: `وحدة مستوردة مكرّرة: ${unit.title}` });
      }
      seenOutlineUnits.add(unitKey);
      const seenUnitLessons = new Set<string>();
      for (const lesson of unit.lessons) {
        const lessonKey = `${outline.key}-${unit.number}-${lesson.title.trim()}`;
        if (seenUnitLessons.has(lessonKey)) {
          issues.push({ kind: 'lesson', detail: `درس مستورد مكرّر: ${lesson.title}` });
        }
        seenUnitLessons.add(lessonKey);
      }
    }
  }
  return issues;
}

/**
 * صيغة الاستيراد الجماعي لكتاب رسمي (JSON) — تُستخدم عند توفّر ملف الكتاب:
 * {
 *   "gradeNumber": 4, "subject": "الرياضيات", "semester": 1,
 *   "sourcePage": "https://www.nccd.gov.jo/...",
 *   "units": [{ "title": "الوحدة الأولى", "lessons": [{ "title": "الدرس الأول", "objective": "...", "explanation": "...", "questions": [] }] }]
 * }
 * لا تُقبل أي وحدة أو درس بلا مرجع من الكتاب الرسمي.
 */
export const BOOK_IMPORT_SHAPE = 'gradeNumber + subject + semester + units[].lessons[].questions[]';

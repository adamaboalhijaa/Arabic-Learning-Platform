// مصنع محتوى الرياضيات: يبني وحدة محتوى كاملة لأي صف دراسي (وحدات، دروس، أسئلة، فصول دراسية)
// مع دوال البحث والتحقق، حتى تعمل الصفحات نفسها لكل الصفوف دون تكرار.
import type { MathLesson, MathQuestion, MathUnit } from './math10/types';
import { questionLevel } from './math10/types';

export { QUESTION_LEVEL_LABELS, questionLevel } from './math10/types';
export type {
  MathLesson,
  MathQuestion,
  MathUnit,
  MathQuestionKind,
  MathQuestionLevel,
} from './math10/types';

export interface MathMeta {
  subject: string;
  grade: string;
  semester: string;
  book: string;
  country: string;
}

export interface MathSemester {
  number: number;
  title: string;
  units: MathUnit[];
}

export interface MathContentIssue {
  questionId: string;
  message: string;
}

export interface MathLevelCounts {
  easy: number;
  medium: number;
  hard: number;
}

export interface MathContent {
  grade: number;
  /** مسار صفحة الوحدات لهذا الصف */
  hubPath: string;
  meta: MathMeta;
  units: MathUnit[];
  lessons: MathLesson[];
  semesters: MathSemester[];
  questionTotal: number;
  findUnit(unitId: string): MathUnit | undefined;
  findLesson(lessonId: string): MathLesson | undefined;
  findUnitOfLesson(lessonId: string): MathUnit | undefined;
  findSemesterOfUnit(unitId: string): MathSemester | undefined;
  unitQuestionCount(unitId: string): number;
  lessonLevelCounts(lesson: MathLesson): MathLevelCounts;
  levelTotals(): MathLevelCounts;
  nextLesson(lessonId: string): MathLesson | null;
  lessonPosition(lessonId: string): { index: number; total: number };
  validate(): MathContentIssue[];
}

export interface MathContentSpec {
  grade: number;
  hubPath: string;
  meta: MathMeta;
  units: MathUnit[];
  /** عدد الوحدات في الفصل الدراسي الأول (الباقي للفصل الثاني) */
  unitsPerSemester: number;
}

const LEVEL_ORDER: Record<'easy' | 'medium' | 'hard', number> = { easy: 0, medium: 1, hard: 2 };

function sortByLevel(questions: MathQuestion[]): MathQuestion[] {
  return [...questions].sort((a, b) => LEVEL_ORDER[questionLevel(a)] - LEVEL_ORDER[questionLevel(b)]);
}

export function buildMathContent(spec: MathContentSpec): MathContent {
  const units: MathUnit[] = spec.units.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => ({ ...lesson, questions: sortByLevel(lesson.questions) })),
  }));
  const lessons: MathLesson[] = units.flatMap((unit) => unit.lessons);
  const split = spec.unitsPerSemester;
  const semesters: MathSemester[] = [
    { number: 1, title: 'الفصل الدراسي الأول', units: units.slice(0, split) },
    { number: 2, title: 'الفصل الدراسي الثاني', units: units.slice(split) },
  ].filter((semester) => semester.units.length > 0);

  const findUnit = (unitId: string) => units.find((unit) => unit.id === unitId);
  const findLesson = (lessonId: string) => lessons.find((lesson) => lesson.id === lessonId);
  const findUnitOfLesson = (lessonId: string) =>
    units.find((unit) => unit.lessons.some((lesson) => lesson.id === lessonId));

  const lessonLevelCounts = (lesson: MathLesson): MathLevelCounts => {
    const counts: MathLevelCounts = { easy: 0, medium: 0, hard: 0 };
    for (const question of lesson.questions) counts[questionLevel(question)] += 1;
    return counts;
  };

  return {
    grade: spec.grade,
    hubPath: spec.hubPath,
    meta: spec.meta,
    units,
    lessons,
    semesters,
    questionTotal: lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0),
    findUnit,
    findLesson,
    findUnitOfLesson,
    findSemesterOfUnit: (unitId) => semesters.find((semester) => semester.units.some((unit) => unit.id === unitId)),
    unitQuestionCount: (unitId) =>
      findUnit(unitId)?.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0) ?? 0,
    lessonLevelCounts,
    levelTotals: () => {
      const totals: MathLevelCounts = { easy: 0, medium: 0, hard: 0 };
      for (const lesson of lessons) {
        const counts = lessonLevelCounts(lesson);
        totals.easy += counts.easy;
        totals.medium += counts.medium;
        totals.hard += counts.hard;
      }
      return totals;
    },
    nextLesson: (lessonId) => {
      const index = lessons.findIndex((lesson) => lesson.id === lessonId);
      if (index < 0 || index === lessons.length - 1) return null;
      return lessons[index + 1];
    },
    lessonPosition: (lessonId) => {
      const unit = findUnitOfLesson(lessonId);
      if (!unit) return { index: 0, total: 0 };
      return { index: unit.lessons.findIndex((lesson) => lesson.id === lessonId) + 1, total: unit.lessons.length };
    },
    validate: () => {
      const issues: MathContentIssue[] = [];
      const lessonIds = new Set<string>();
      const questionIds = new Set<string>();

      for (const unit of units) {
        if (!unit.lessons.length) issues.push({ questionId: unit.id, message: 'وحدة بلا دروس' });
        for (const lesson of unit.lessons) {
          if (lessonIds.has(lesson.id)) issues.push({ questionId: lesson.id, message: 'معرّف درس مكرر' });
          lessonIds.add(lesson.id);

          if (!lesson.questions.length) issues.push({ questionId: lesson.id, message: 'درس بلا أسئلة' });
          if (!lesson.explanation.trim()) issues.push({ questionId: lesson.id, message: 'درس بلا شرح' });
          if (!lesson.objective.trim()) issues.push({ questionId: lesson.id, message: 'درس بلا هدف' });
          if (!lesson.objectives.length) issues.push({ questionId: lesson.id, message: 'درس بلا أهداف فرعية' });
          if (!lesson.examples.length) issues.push({ questionId: lesson.id, message: 'درس بلا أمثلة محلولة' });

          const levels = new Set(lesson.questions.map((question) => questionLevel(question)));
          if (!levels.has('easy')) issues.push({ questionId: lesson.id, message: 'درس بلا سؤال سهل' });
          if (!levels.has('medium')) issues.push({ questionId: lesson.id, message: 'درس بلا سؤال متوسط' });
          if (!levels.has('hard')) issues.push({ questionId: lesson.id, message: 'درس بلا سؤال متقدم' });
          if (!lesson.questions.some((question) => question.kind === 'mcq')) {
            issues.push({ questionId: lesson.id, message: 'درس بلا سؤال اختيار من متعدد' });
          }
          if (!lesson.questions.some((question) => question.kind === 'truefalse')) {
            issues.push({ questionId: lesson.id, message: 'درس بلا سؤال صح وخطأ' });
          }

          for (const question of lesson.questions) {
            if (questionIds.has(question.id)) issues.push({ questionId: question.id, message: 'معرّف سؤال مكرر' });
            questionIds.add(question.id);

            if (question.kind === 'truefalse') {
              if (question.options.length !== 2) {
                issues.push({ questionId: question.id, message: 'سؤال صح/خطأ يجب أن يحتوي خيارين' });
              }
            } else if (question.options.length < 3) {
              issues.push({ questionId: question.id, message: 'سؤال الاختيار من متعدد يحتاج 3 خيارات على الأقل' });
            }

            if (question.correctOption < 0 || question.correctOption >= question.options.length) {
              issues.push({ questionId: question.id, message: 'الإجابة الصحيحة خارج حدود الخيارات' });
            }
            if (new Set(question.options).size !== question.options.length) {
              issues.push({ questionId: question.id, message: 'خيارات مكررة' });
            }
            if (!question.explanation.trim()) issues.push({ questionId: question.id, message: 'سؤال بلا شرح' });
            if (!question.page.trim()) issues.push({ questionId: question.id, message: 'سؤال بلا مرجع' });
            if (!question.prompt.trim()) issues.push({ questionId: question.id, message: 'سؤال بلا نص' });
          }
        }
      }

      return issues;
    },
  };
}

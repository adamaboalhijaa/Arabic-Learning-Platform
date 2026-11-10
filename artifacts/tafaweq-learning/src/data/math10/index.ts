import type { MathLesson, MathQuestion, MathUnit } from './types';
import { unit1 } from './unit1';
import { unit2 } from './unit2';
import { unit3 } from './unit3';
import { unit4 } from './unit4';
import { unit5 } from './unit5';
import { unit6 } from './unit6';
import { unit7 } from './unit7';
import { unit8 } from './unit8';
import { EXTRA_FIRST } from './extra-first';
import { EXTRA_SECOND } from './extra-second';

export type {
  MathLesson,
  MathQuestion,
  MathUnit,
  MathFormula,
  MathExample,
  MathQuestionKind,
  MathQuestionLevel,
} from './types';
import { questionLevel } from './types';
export { QUESTION_LEVEL_LABELS, questionLevel } from './types';

const BASE_UNITS: MathUnit[] = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8];

const LEVEL_ORDER: Record<'easy' | 'medium' | 'hard', number> = { easy: 0, medium: 1, hard: 2 };

/** يدمج الأسئلة الأساسية مع أسئلة الصعوبة الإضافية ويرتّبها: سهل ثم متوسط ثم متقدم. */
function mergeQuestions(lessonId: string, base: MathQuestion[]): MathQuestion[] {
  const extra = [...(EXTRA_FIRST[lessonId] ?? []), ...(EXTRA_SECOND[lessonId] ?? [])];
  return [...base, ...extra].sort(
    (a, b) => LEVEL_ORDER[questionLevel(a)] - LEVEL_ORDER[questionLevel(b)],
  );
}

// رياضيات الصف العاشر — المنهاج الأردني (الوحدات 1–4 الفصل الأول، والوحدات 5–8 الفصل الثاني)
export const MATH10_UNITS: MathUnit[] = BASE_UNITS.map((unit) => ({
  ...unit,
  lessons: unit.lessons.map((lesson) => ({
    ...lesson,
    questions: mergeQuestions(lesson.id, lesson.questions),
  })),
}));

/** الفصلان الدراسيان مع وحدات كل فصل، لعرض المنهاج مقسّمًا كما في الكتاب. */
export const MATH10_SEMESTERS: { number: number; title: string; units: MathUnit[] }[] = [
  { number: 1, title: 'الفصل الدراسي الأول', units: MATH10_UNITS.slice(0, 4) },
  { number: 2, title: 'الفصل الدراسي الثاني', units: MATH10_UNITS.slice(4) },
];

export const MATH10_META = {
  subject: 'الرياضيات',
  grade: 'الصف العاشر',
  semester: 'الفصلان الأول والثاني',
  book: 'كتاب الطالب — الرياضيات للصف العاشر',
  country: 'الأردن',
} as const;

export const MATH10_LESSONS: MathLesson[] = MATH10_UNITS.flatMap((unit) => unit.lessons);

export function findUnit(unitId: string): MathUnit | undefined {
  return MATH10_UNITS.find((unit) => unit.id === unitId);
}

export function findLesson(lessonId: string): MathLesson | undefined {
  return MATH10_LESSONS.find((lesson) => lesson.id === lessonId);
}

export function findUnitOfLesson(lessonId: string): MathUnit | undefined {
  return MATH10_UNITS.find((unit) => unit.lessons.some((lesson) => lesson.id === lessonId));
}

export function lessonQuestionCount(): number {
  return MATH10_LESSONS.reduce((sum, lesson) => sum + lesson.questions.length, 0);
}

/** عدد أسئلة الدرس موزّعًا على درجات الصعوبة. */
export function lessonLevelCounts(lesson: MathLesson): { easy: number; medium: number; hard: number } {
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const question of lesson.questions) {
    counts[questionLevel(question)] += 1;
  }
  return counts;
}

/** عدد أسئلة المنهاج كاملًا موزّعًا على درجات الصعوبة. */
export function math10LevelTotals(): { easy: number; medium: number; hard: number } {
  const totals = { easy: 0, medium: 0, hard: 0 };
  for (const lesson of MATH10_LESSONS) {
    const counts = lessonLevelCounts(lesson);
    totals.easy += counts.easy;
    totals.medium += counts.medium;
    totals.hard += counts.hard;
  }
  return totals;
}

/** عدد أسئلة وحدة معيّنة. */
export function unitQuestionCount(unitId: string): number {
  const unit = findUnit(unitId);
  if (!unit) return 0;
  return unit.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);
}

/** الدرس التالي في تسلسل المنهاج، أو null إذا كان الدرس الأخير. */
export function nextLesson(lessonId: string): MathLesson | null {
  const index = MATH10_LESSONS.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0 || index === MATH10_LESSONS.length - 1) return null;
  return MATH10_LESSONS[index + 1];
}

/** فهرس الدرس داخل وحدته، مفيد لعرض «الدرس 2 من 3». */
export function lessonPosition(lessonId: string): { index: number; total: number } {
  const unit = findUnitOfLesson(lessonId);
  if (!unit) return { index: 0, total: 0 };
  return {
    index: unit.lessons.findIndex((lesson) => lesson.id === lessonId) + 1,
    total: unit.lessons.length,
  };
}

export interface MathContentIssue {
  questionId: string;
  message: string;
}

/**
 * تحقق من سلامة المحتوى: لكل درس أسئلته الخاصة، ولكل سؤال خيارات صحيحة
 * وإجابة صحيحة داخل حدود الخيارات وشرح مبسّط ومرجع صفحة.
 */
export function validateMathContent(): MathContentIssue[] {
  const issues: MathContentIssue[] = [];
  const lessonIds = new Set<string>();
  const questionIds = new Set<string>();

  for (const unit of MATH10_UNITS) {
    if (!unit.lessons.length) {
      issues.push({ questionId: unit.id, message: 'وحدة بلا دروس' });
    }
    for (const lesson of unit.lessons) {
      if (lessonIds.has(lesson.id)) {
        issues.push({ questionId: lesson.id, message: 'معرّف درس مكرر' });
      }
      lessonIds.add(lesson.id);

      if (!lesson.questions.length) {
        issues.push({ questionId: lesson.id, message: 'درس بلا أسئلة' });
      }
      if (!lesson.explanation.trim()) {
        issues.push({ questionId: lesson.id, message: 'درس بلا شرح' });
      }

      const levels = new Set(lesson.questions.map((question) => questionLevel(question)));
      if (!levels.has('easy')) {
        issues.push({ questionId: lesson.id, message: 'درس بلا سؤال سهل' });
      }
      if (!levels.has('hard')) {
        issues.push({ questionId: lesson.id, message: 'درس بلا سؤال متقدم' });
      }
      if (!lesson.questions.some((question) => question.kind === 'mcq')) {
        issues.push({ questionId: lesson.id, message: 'درس بلا سؤال اختيار من متعدد' });
      }
      if (!lesson.questions.some((question) => question.kind === 'truefalse')) {
        issues.push({ questionId: lesson.id, message: 'درس بلا سؤال صح وخطأ' });
      }

      for (const question of lesson.questions) {
        if (questionIds.has(question.id)) {
          issues.push({ questionId: question.id, message: 'معرّف سؤال مكرر' });
        }
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
        if (!question.explanation.trim()) {
          issues.push({ questionId: question.id, message: 'سؤال بلا شرح' });
        }
        if (!question.page.trim()) {
          issues.push({ questionId: question.id, message: 'سؤال بلا مرجع صفحة' });
        }
        if (!question.prompt.trim()) {
          issues.push({ questionId: question.id, message: 'سؤال بلا نص' });
        }
      }
    }
  }

  const knownLessons = new Set(MATH10_LESSONS.map((lesson) => lesson.id));
  for (const lessonId of [...Object.keys(EXTRA_FIRST), ...Object.keys(EXTRA_SECOND)]) {
    if (!knownLessons.has(lessonId)) {
      issues.push({ questionId: lessonId, message: 'أسئلة إضافية مرتبطة بدرس غير موجود' });
    }
  }

  return issues;
}

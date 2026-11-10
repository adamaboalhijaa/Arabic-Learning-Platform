import type { MathLesson, MathQuestion, MathUnit } from './types';
import { unit1 } from './unit1';
import { unit2 } from './unit2';
import { unit3 } from './unit3';
import { unit4 } from './unit4';

export type {
  MathLesson,
  MathQuestion,
  MathUnit,
  MathFormula,
  MathExample,
  MathQuestionKind,
  MathQuestionLevel,
} from './types';
export { QUESTION_LEVEL_LABELS, questionLevel } from './types';

// رياضيات الصف العاشر — المنهاج الأردني، كتاب الفصل الأول (أربع وحدات فقط)
export const MATH10_UNITS: MathUnit[] = [unit1, unit2, unit3, unit4];

export const MATH10_META = {
  subject: 'الرياضيات',
  grade: 'الصف العاشر',
  semester: 'الفصل الأول',
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

  return issues;
}

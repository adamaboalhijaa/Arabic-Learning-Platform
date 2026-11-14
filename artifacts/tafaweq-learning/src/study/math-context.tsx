// سياق الرياضيات: يوفّر باقة محتوى الصف الحالي ومساره الأساسي لكل الصفحات،
// فتعمل الصفحة نفسها لأي صف دراسي دون تكرار الكود.
import { createContext, useContext, type ReactNode } from 'react';
import {
  DEFAULT_MATH_CONTENT,
  MATH_GRADES,
  mathContentForGrade,
  type MathContent,
} from '../data/math-grades';
import { QUESTION_LEVEL_LABELS, questionLevel } from '../data/math-content';

interface MathContextValue {
  content: MathContent;
  base: string;
}

const MathContext = createContext<MathContextValue>({
  content: DEFAULT_MATH_CONTENT,
  base: DEFAULT_MATH_CONTENT.hubPath,
});

export function MathProvider({ grade, children }: { grade: number; children: ReactNode }) {
  const content = mathContentForGrade(grade) ?? DEFAULT_MATH_CONTENT;
  return <MathContext.Provider value={{ content, base: content.hubPath }}>{children}</MathContext.Provider>;
}

/** باقة موحّدة بأسماء الدوال نفسها التي كانت تستوردها الصفحات من بيانات الصف العاشر. */
export function useMathBundle() {
  const { content, base } = useContext(MathContext);
  return {
    content,
    base,
    grade: content.grade,
    meta: content.meta,
    MATH10_UNITS: content.units,
    MATH10_LESSONS: content.lessons,
    MATH10_META: content.meta,
    MATH10_SEMESTERS: content.semesters,
    findUnit: content.findUnit,
    findLesson: content.findLesson,
    findUnitOfLesson: content.findUnitOfLesson,
    findSemesterOfUnit: content.findSemesterOfUnit,
    lessonQuestionCount: () => content.questionTotal,
    unitQuestionCount: content.unitQuestionCount,
    lessonLevelCounts: content.lessonLevelCounts,
    math10LevelTotals: content.levelTotals,
    nextLesson: content.nextLesson,
    lessonPosition: content.lessonPosition,
    validateMathContent: () => content.validate(),
    gradeOptions: MATH_GRADES.map((item) => ({ grade: item.grade, label: item.meta.grade, hubPath: item.hubPath })),
    QUESTION_LEVEL_LABELS,
    questionLevel,
  };
}

export function useMathBase(): string {
  return useContext(MathContext).base;
}

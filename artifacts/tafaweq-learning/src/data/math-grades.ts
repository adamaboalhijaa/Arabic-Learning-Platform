// سجل محتوى الرياضيات لكل صف: يربط رقم الصف بباقة المحتوى ومسار صفحته.
// الصف العاشر يبقى على المسار الأصلي /math، والصف الأول على /math/grade/1.
import { buildMathContent, type MathContent } from './math-content';
import { MATH1 } from './math1';
import { MATH10_UNITS } from './math10';

export const MATH10_CONTENT: MathContent = buildMathContent({
  grade: 10,
  hubPath: '/math',
  meta: {
    subject: 'الرياضيات',
    grade: 'الصف العاشر',
    semester: 'الفصلان الدراسيان الأول والثاني',
    book: 'كتاب الرياضيات — الصف العاشر (المنهاج الأردني)',
    country: 'الأردن',
  },
  units: MATH10_UNITS,
  unitsPerSemester: 4,
});

/** الصفوف المتوفرة فعليًا في الموقع، مرتبة تصاعديًا. */
export const MATH_GRADES: MathContent[] = [MATH1, MATH10_CONTENT];

export const DEFAULT_MATH_GRADE = 10;

export const DEFAULT_MATH_CONTENT = MATH10_CONTENT;

export function mathContentForGrade(grade: number): MathContent | undefined {
  return MATH_GRADES.find((content) => content.grade === grade);
}

export function mathHubPathForGrade(grade: number): string {
  return mathContentForGrade(grade)?.hubPath ?? MATH10_CONTENT.hubPath;
}

export type { MathContent } from './math-content';

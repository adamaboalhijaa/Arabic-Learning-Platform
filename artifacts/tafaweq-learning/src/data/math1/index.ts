// رياضيات الصف الأول الأساسي — تجميع الفصلين الدراسيين مع دوال البحث والتحقق.
import { buildMathContent } from '../math-content';
import { MATH1_SEMESTER1 } from './semester1';
import { MATH1_SEMESTER2 } from './semester2';

export const MATH1 = buildMathContent({
  grade: 1,
  hubPath: '/math/grade/1',
  meta: {
    subject: 'الرياضيات',
    grade: 'الصف الأول',
    semester: 'الفصلان الدراسيان الأول والثاني',
    book: 'كتاب الرياضيات — الصف الأول الأساسي (المنهاج الأردني)',
    country: 'الأردن',
  },
  units: [...MATH1_SEMESTER1, ...MATH1_SEMESTER2],
  unitsPerSemester: 4,
});

export { MATH1_SEMESTER1, MATH1_SEMESTER2 };

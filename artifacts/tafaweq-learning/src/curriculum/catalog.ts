/**
 * هيكل المنهاج الأردني: الصفوف من الأول إلى الثاني عشر، والمواد المعتمدة في كل صف،
 * والفصلان الدراسيان.
 *
 * هذا الملف يبني **الهيكل فقط** (صف/مادة/فصل) ولا يخترع وحدات أو دروسًا أو أسئلة:
 * الوحدات والدروس والأسئلة تُستورد من ملفات المنهاج الرسمية عبر نظام الاستيراد المجمّع،
 * وتبقى نسبة الإنجاز 0% حتى يتم الاستيراد الفعلي.
 */
import { stableId } from './keys';
import type { CurriculumGrade, CurriculumSemester, CurriculumSubject } from './types';
import { CURRICULUM_VERSION } from './store-constants';

export const GRADE_TITLES = [
  'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس',
  'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر',
];

export const STAGES: Array<{ from: number; to: number; title: string }> = [
  { from: 1, to: 4, title: 'المرحلة الأساسية الدنيا' },
  { from: 5, to: 10, title: 'المرحلة الأساسية العليا' },
  { from: 11, to: 12, title: 'المرحلة الثانوية' },
];

export function gradeTitle(gradeNumber: number): string {
  return `الصف ${GRADE_TITLES[gradeNumber - 1] ?? gradeNumber}`;
}

export function stageOf(gradeNumber: number): string {
  return STAGES.find((stage) => gradeNumber >= stage.from && gradeNumber <= stage.to)?.title ?? 'مرحلة غير محددة';
}

interface SubjectSpec {
  title: string;
  stream?: string;
  note?: string;
}

const NOTE_IMPORT = 'الوحدات والدروس تُستورد من الكتاب الرسمي المعتمد.';

/** المواد المشتركة في المرحلة الأساسية الدنيا (الصفوف 1–4). */
const BASIC_LOWER: SubjectSpec[] = [
  { title: 'اللغة العربية' },
  { title: 'الرياضيات' },
  { title: 'العلوم' },
  { title: 'التربية الإسلامية' },
  { title: 'التربية الاجتماعية والوطنية' },
  { title: 'اللغة الإنجليزية' },
  { title: 'التربية الفنية' },
  { title: 'التربية الرياضية' },
];

/** الصفوف 5–6: تُضاف التربية المهنية والحاسوب. */
const BASIC_UPPER_EARLY: SubjectSpec[] = [
  ...BASIC_LOWER,
  { title: 'التربية المهنية' },
  { title: 'الحاسوب وتكنولوجيا المعلومات' },
];

/** الصفوف 7–9: تُضاف اللغة الفرنسية والاجتماعيات. */
const BASIC_UPPER: SubjectSpec[] = [
  { title: 'اللغة العربية' },
  { title: 'الرياضيات' },
  { title: 'العلوم' },
  { title: 'التربية الإسلامية' },
  { title: 'الاجتماعيات' },
  { title: 'اللغة الإنجليزية' },
  { title: 'اللغة الفرنسية' },
  { title: 'التربية المهنية' },
  { title: 'الحاسوب وتكنولوجيا المعلومات' },
  { title: 'التربية الفنية' },
  { title: 'التربية الرياضية' },
];

/** الصف العاشر: نهاية المرحلة الأساسية العليا. */
const GRADE_TEN: SubjectSpec[] = [
  { title: 'اللغة العربية' },
  { title: 'الرياضيات' },
  { title: 'الفيزياء' },
  { title: 'الكيمياء' },
  { title: 'الأحياء' },
  { title: 'التربية الإسلامية' },
  { title: 'الاجتماعيات' },
  { title: 'اللغة الإنجليزية' },
  { title: 'التربية المهنية' },
  { title: 'الحاسوب وتكنولوجيا المعلومات' },
  { title: 'التربية الرياضية' },
];

/** المرحلة الثانوية: مواد مشتركة + مواد كل فرع. */
const SECONDARY: SubjectSpec[] = [
  { title: 'اللغة العربية', stream: 'مشترك' },
  { title: 'اللغة الإنجليزية', stream: 'مشترك' },
  { title: 'التربية الإسلامية', stream: 'مشترك' },
  { title: 'الحاسوب وتكنولوجيا المعلومات', stream: 'مشترك' },
  { title: 'الرياضيات', stream: 'علمي' },
  { title: 'الفيزياء', stream: 'علمي' },
  { title: 'الكيمياء', stream: 'علمي' },
  { title: 'الأحياء', stream: 'علمي' },
  { title: 'علوم الأرض والبيئة', stream: 'علمي' },
  { title: 'الرياضيات', stream: 'أدبي' },
  { title: 'التاريخ', stream: 'أدبي' },
  { title: 'الجغرافيا', stream: 'أدبي' },
  { title: 'العلوم الإسلامية', stream: 'شرعي' },
];

function subjectsFor(gradeNumber: number): SubjectSpec[] {
  if (gradeNumber <= 4) return BASIC_LOWER;
  if (gradeNumber <= 6) return BASIC_UPPER_EARLY;
  if (gradeNumber <= 9) return BASIC_UPPER;
  if (gradeNumber === 10) return GRADE_TEN;
  return SECONDARY;
}

export function emptySemesters(): CurriculumSemester[] {
  return [
    { number: 1, units: [] },
    { number: 2, units: [] },
  ];
}

export function makeSubject(
  gradeNumber: number,
  title: string,
  stream = '',
  note = NOTE_IMPORT,
): CurriculumSubject {
  return {
    id: stableId('sub', `${gradeNumber}|${stream}|${title}`),
    title,
    stream,
    note,
    semesters: emptySemesters(),
  };
}

/** يبني صفًا واحدًا مع مواده وفصليه، بلا أي محتوى وحدات. */
export function makeGrade(gradeNumber: number): CurriculumGrade {
  return {
    gradeNumber,
    title: gradeTitle(gradeNumber),
    stage: stageOf(gradeNumber),
    subjects: subjectsFor(gradeNumber).map((spec) =>
      makeSubject(gradeNumber, spec.title, spec.stream ?? '', spec.note ?? NOTE_IMPORT),
    ),
  };
}

/** الصفوف من 1 إلى 12 كاملة. */
export function buildCatalog(): CurriculumGrade[] {
  return Array.from({ length: 12 }, (_, index) => makeGrade(index + 1));
}

export { CURRICULUM_VERSION };

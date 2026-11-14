/**
 * وحدات ودروس مُستوردة من كتب المنهاج الأردني الفعلية (outline فقط، بلا أسئلة).
 *
 * المصدر: شبكة منهاجي الأردنية (minhaji.net) لعناوين الوحدات والدروس وروابط كل درس،
 * والتحقق من ترتيب الوحدات وتقسيم الفصل الدراسي من فهرس كتاب الطالب PDF نفسه.
 *
 * قواعد صارمة:
 * - لا يُضاف هنا أي عنوان لم يُقرأ من المصدر؛ لا صياغة تقديرية ولا دروس مُخترعة.
 * - الأسئلة لا تُولَّد تلقائيًا: الكتاب المستورد يظهر «مربوط» بوحداته ودروسه،
 *   وحقل الأسئلة يبقى صفرًا حتى تُكتب أسئلة مطابقة لمحتواه.
 * - الفصل الدراسي يُسجل فقط عندما يثبته فهرس كتاب ذلك الفصل (verifiedBy).
 */

export type ImportedLesson = {
  /** عنوان الدرس كما ورد في المصدر. */
  title: string;
  /** رابط صفحة الدرس في المصدر (minhaji.net). */
  sourceUrl?: string;
};

export type ImportedUnit = {
  /** رقم الوحدة كما في الكتاب. */
  number: number;
  title: string;
  lessons: ImportedLesson[];
};

export type ImportedBookOutline = {
  key: string;
  gradeNumber: number;
  /** عنوان المادة كما في سجل المناهج. */
  subjectTitle: string;
  semester: 1 | 2;
  bookTitle: string;
  sourceName: string;
  sourceUrl: string;
  /** الدليل الذي يثبت ترتيب الوحدات وتقسيم الفصل. */
  verifiedBy: string;
  units: ImportedUnit[];
};

const MINHAJI = 'https://minhaji.net/lesson';

/** رياضيات الصف الخامس — كتاب الطالب، الفصل الدراسي الأول (الوحدات 1–5). */
const G5_MATH_S1: ImportedBookOutline = {
  key: 'g5-math-s1',
  gradeNumber: 5,
  subjectTitle: 'الرياضيات',
  semester: 1,
  bookTitle: 'كتاب الطالب — الرياضيات — الفصل الأول',
  sourceName: 'شبكة منهاجي الأردنية + فهرس كتاب الطالب PDF',
  sourceUrl: `${MINHAJI}/960`,
  verifiedBy:
    'فهرس كتاب الطالب للفصل الأول (137 صفحة): الوحدة 1 ص11، الوحدة 4 ص78، وبداية الوحدة 5 ص117 — فالفصل الأول يضم الوحدات 1–5.',
  units: [
    {
      number: 1,
      title: 'الأعداد: جمعها وطرحها',
      lessons: [
        { title: 'القيمة المنزلية ضمن الملايين', sourceUrl: `${MINHAJI}/27543` },
        { title: 'مقارنة الأعداد وترتيبها', sourceUrl: `${MINHAJI}/27548` },
        { title: 'جمع الأعداد الكلية وطرحها', sourceUrl: `${MINHAJI}/27552` },
        { title: 'الأعداد السالبة', sourceUrl: `${MINHAJI}/27557` },
        { title: 'خطة حل المسألة', sourceUrl: `${MINHAJI}/34082` },
      ],
    },
    {
      number: 2,
      title: 'الضرب والقسمة',
      lessons: [
        { title: 'الضرب الذهني', sourceUrl: `${MINHAJI}/27566` },
        { title: 'تقدير نواتج الضرب', sourceUrl: `${MINHAJI}/2141` },
        { title: 'ضرب الأعداد', sourceUrl: `${MINHAJI}/2145` },
        { title: 'تقدير ناتج القسمة', sourceUrl: `${MINHAJI}/2151` },
        { title: 'قسمة الأعداد', sourceUrl: `${MINHAJI}/18928` },
      ],
    },
    {
      number: 3,
      title: 'خصائص الأعداد',
      lessons: [
        { title: 'قابلية القسمة على 4 و 6 و 9', sourceUrl: `${MINHAJI}/16818` },
        { title: 'تحليل العدد إلى عوامله', sourceUrl: `${MINHAJI}/16854` },
        { title: 'العامل المشترك الأكبر', sourceUrl: `${MINHAJI}/22365` },
        { title: 'المضاعف المشترك الأصغر', sourceUrl: `${MINHAJI}/22366` },
        { title: 'مربع العدد والجذر التربيعي', sourceUrl: `${MINHAJI}/22367` },
      ],
    },
    {
      number: 4,
      title: 'الكسور والعمليات عليها',
      lessons: [
        { title: 'الأعداد الكسرية', sourceUrl: `${MINHAJI}/15329` },
        { title: 'جمع الكسور', sourceUrl: `${MINHAJI}/23565` },
      ],
    },
    {
      number: 5,
      title: 'تمثيل البيانات وتفسيرها',
      lessons: [{ title: 'بناء الجدول التكراري وتفسيره', sourceUrl: `${MINHAJI}/15660` }],
    },
  ],
};

/** رياضيات الصف الخامس — كتاب الطالب، الفصل الدراسي الثاني (الوحدات 6–10). */
const G5_MATH_S2: ImportedBookOutline = {
  key: 'g5-math-s2',
  gradeNumber: 5,
  subjectTitle: 'الرياضيات',
  semester: 2,
  bookTitle: 'كتاب الطالب — الرياضيات — الفصل الثاني',
  sourceName: 'شبكة منهاجي الأردنية + فهرس كتاب الطالب PDF',
  sourceUrl: `${MINHAJI}/960`,
  verifiedBy:
    'فهرس كتاب الطالب للفصل الأول ينتهي بالوحدة 5، وترتيب الوحدات في المصدر مطابق لفهرس الكتاب — فالفصل الثاني يضم الوحدات 6–10.',
  units: [
    {
      number: 6,
      title: 'الأعداد العشرية والعمليات عليها',
      lessons: [
        { title: 'أجزاء الألف', sourceUrl: `${MINHAJI}/23549` },
        { title: 'تحويل الكسر إلى كسر عشري', sourceUrl: `${MINHAJI}/23553` },
        { title: 'مقارنة الأعداد العشرية', sourceUrl: `${MINHAJI}/23557` },
        { title: 'تقريب الأعداد العشرية', sourceUrl: `${MINHAJI}/23561` },
        { title: 'تقدير نواتج جمع الأعداد العشرية وطرحها', sourceUrl: `${MINHAJI}/34926` },
        { title: 'جمع الأعداد العشرية وطرحها', sourceUrl: `${MINHAJI}/23569` },
        { title: 'ضرب الأعداد العشرية وقسمتها', sourceUrl: `${MINHAJI}/23573` },
        { title: 'النسبة المئوية', sourceUrl: `${MINHAJI}/23576` },
      ],
    },
    {
      number: 7,
      title: 'المعادلات',
      lessons: [
        { title: 'إيجاد قيمة المقدار الجبري', sourceUrl: `${MINHAJI}/23623` },
        { title: 'معادلات الجمع والطرح', sourceUrl: `${MINHAJI}/23628` },
        { title: 'معادلات الضرب والقسمة', sourceUrl: `${MINHAJI}/23696` },
        { title: 'أرسم نموذجاً', sourceUrl: `${MINHAJI}/24014` },
      ],
    },
    {
      number: 8,
      title: 'الهندسة',
      lessons: [
        { title: 'مجموع الزوايا على مستقيم وحول نقطة', sourceUrl: `${MINHAJI}/23754` },
        { title: 'المضلعات', sourceUrl: `${MINHAJI}/23742` },
        { title: 'تصنيف المثلثات حسب أطوال أضلاعها', sourceUrl: `${MINHAJI}/23746` },
        { title: 'تصنيف المثلثات حسب قياسات زواياها', sourceUrl: `${MINHAJI}/23751` },
        { title: 'تصنيف الأشكال الرباعية', sourceUrl: `${MINHAJI}/23757` },
        { title: 'الانسحاب', sourceUrl: `${MINHAJI}/23761` },
        { title: 'الانعكاس', sourceUrl: `${MINHAJI}/23770` },
      ],
    },
    {
      number: 9,
      title: 'القياس',
      lessons: [
        { title: 'وحدات قياس الكتلة', sourceUrl: `${MINHAJI}/23775` },
        { title: 'وحدات قياس السعة والطول', sourceUrl: `${MINHAJI}/23778` },
        { title: 'الزمن', sourceUrl: `${MINHAJI}/23780` },
        { title: 'محيط الشكل المركب ومساحته', sourceUrl: `${MINHAJI}/23782` },
      ],
    },
    {
      number: 10,
      title: 'الإحصاء والاحتمال',
      lessons: [
        { title: 'الوسط الحسابي', sourceUrl: `${MINHAJI}/23794` },
        { title: 'الوسيط والمنوال', sourceUrl: `${MINHAJI}/23797` },
        { title: 'المدى', sourceUrl: `${MINHAJI}/23800` },
        { title: 'فرص الحدوث', sourceUrl: `${MINHAJI}/23804` },
      ],
    },
  ],
};

export const IMPORTED_OUTLINES: ImportedBookOutline[] = [G5_MATH_S1, G5_MATH_S2];

/** إحصاءات كتاب مستورد واحد. */
export function outlineStats(outline: ImportedBookOutline) {
  const lessons = outline.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  return { units: outline.units.length, lessons };
}

/** الكتاب المستورد المطابق لصف/مادة/فصل، أو undefined. */
export function outlineFor(gradeNumber: number, subjectTitle: string, semester: 1 | 2) {
  const title = subjectTitle.trim();
  return IMPORTED_OUTLINES.find(
    (outline) =>
      outline.gradeNumber === gradeNumber &&
      outline.semester === semester &&
      outline.subjectTitle.trim() === title,
  );
}

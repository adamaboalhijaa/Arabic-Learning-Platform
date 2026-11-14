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
  /** الفصل الدراسي المثبَت، أو null إذا لم يثبته المصدر. */
  semester: 1 | 2 | null;
  /** هل يثبت المصدر تقسيم الوحدات على الفصلين الدراسيين؟ */
  semesterVerified: boolean;
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
  semesterVerified: true,
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
  semesterVerified: true,
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

/**
 * رياضيات الصف السادس — وحدات ودروس المادة كما وردت في المصدر.
 * تقسيم الفصل الدراسي غير مثبَت: صفحة تنزيل كتاب الطالب تعيد HTML لا PDF،
 * لذلك لا يُنسب أي درس إلى فصل دراسي معيّن هنا.
 */
const G6_MATH: ImportedBookOutline = {
  key: 'g6-math',
  gradeNumber: 6,
  subjectTitle: 'الرياضيات',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/1058`,
  verifiedBy:
    'عنوان كل وحدة ودرس وترتيبها مأخوذة من صفحة مادة الرياضيات للصف السادس في المصدر؛ تقسيم الفصل الدراسي غير مثبت لأن صفحة تنزيل كتاب الطالب تعيد HTML لا ملف PDF.',
  units: [
    {
      number: 1,
      title: 'الأعداد الصحيحة والعمليات عليها',
      lessons: [
        { title: 'الأعداد الصحيحة والقيمة المطلقة', sourceUrl: `${MINHAJI}/3960` },
        { title: 'مقارنة الأعداد الصحيحة وترتيبها', sourceUrl: `${MINHAJI}/3963` },
        { title: 'جمع الأعداد الصحيحة', sourceUrl: `${MINHAJI}/15169` },
        { title: 'طرح الأعداد الصحيحة', sourceUrl: `${MINHAJI}/15156` },
        { title: 'ضرب الأعداد الصحيحة وقسمتها', sourceUrl: `${MINHAJI}/15154` },
      ],
    },
    {
      number: 2,
      title: 'الكسور والعمليات عليها',
      lessons: [
        { title: 'جمع الكسور وطرحها', sourceUrl: `${MINHAJI}/15219` },
        { title: 'جمع الأعداد الكسرية وطرحها', sourceUrl: `${MINHAJI}/22584` },
        { title: 'ضرب الأعداد الكسرية', sourceUrl: `${MINHAJI}/22581` },
        { title: 'قسمة الأعداد الكسرية', sourceUrl: `${MINHAJI}/24948` },
      ],
    },
    {
      number: 3,
      title: 'العمليات على الأعداد العشرية',
      lessons: [
        { title: 'ضرب الأعداد العشرية', sourceUrl: `${MINHAJI}/17468` },
        { title: 'قسمة الأعداد العشرية', sourceUrl: `${MINHAJI}/17471` },
        { title: 'تطبيقات العمليات على الكسور العشرية', sourceUrl: `${MINHAJI}/24950` },
        { title: 'حل مسألة أبسط', sourceUrl: `${MINHAJI}/28044` },
      ],
    },
    {
      number: 4,
      title: 'التحويلات والإنشاءات الهندسية',
      lessons: [
        { title: 'المستوى الإحداثي', sourceUrl: `${MINHAJI}/20434` },
        { title: 'الانسحاب في المستوى الإحداثي', sourceUrl: `${MINHAJI}/20436` },
        { title: 'الانعكاس في المستوى الإحداثي', sourceUrl: `${MINHAJI}/20440` },
        { title: 'الدائرة وأجزاؤها', sourceUrl: `${MINHAJI}/20603` },
        { title: 'إنشاءات هندسية', sourceUrl: `${MINHAJI}/20608` },
        { title: 'رسم المثلث', sourceUrl: `${MINHAJI}/20605` },
      ],
    },
    {
      number: 5,
      title: 'المقادير الجبرية والمعادلات',
      lessons: [
        { title: 'القوى والأسس', sourceUrl: `${MINHAJI}/26023` },
        { title: 'الجذر التربيعي والجذر التكعيبي', sourceUrl: `${MINHAJI}/26027` },
        { title: 'أولويات العمليات', sourceUrl: `${MINHAJI}/26190` },
        { title: 'الخصائص الجبرية', sourceUrl: `${MINHAJI}/26193` },
        { title: 'المعادلات', sourceUrl: `${MINHAJI}/26197` },
        { title: 'المتتاليات', sourceUrl: `${MINHAJI}/26200` },
      ],
    },
    {
      number: 6,
      title: 'النسبة والنسبة المئوية',
      lessons: [
        { title: 'النسبة', sourceUrl: `${MINHAJI}/26255` },
        { title: 'النسب المتكافئة', sourceUrl: `${MINHAJI}/26258` },
        { title: 'النسبة المئوية والكسور العادية', sourceUrl: `${MINHAJI}/26261` },
        { title: 'النسبة المئوية والكسور العشرية', sourceUrl: `${MINHAJI}/26378` },
        { title: 'النسبة المئوية من عدد', sourceUrl: `${MINHAJI}/26380` },
      ],
    },
    {
      number: 7,
      title: 'الهندسة والقياس',
      lessons: [
        { title: 'الأشكال الرباعية', sourceUrl: `${MINHAJI}/26382` },
        { title: 'مساحة متوازي الأضلاع', sourceUrl: `${MINHAJI}/17474` },
        { title: 'مساحة المثلث', sourceUrl: `${MINHAJI}/26457` },
        { title: 'مساحة شبه المنحرف', sourceUrl: `${MINHAJI}/26717` },
        { title: 'حجم المنشور الرباعي ومساحة سطحه', sourceUrl: `${MINHAJI}/26758` },
      ],
    },
    {
      number: 8,
      title: 'الإحصاء والاحتمالات',
      lessons: [
        { title: 'جمع البيانات', sourceUrl: `${MINHAJI}/26461` },
        { title: 'الجداول التكرارية', sourceUrl: `${MINHAJI}/35720` },
        { title: 'الجداول والمخططات التكرارية', sourceUrl: `${MINHAJI}/35732` },
        { title: 'القطاعات الدائرية', sourceUrl: `${MINHAJI}/35735` },
        { title: 'الاحتمالات', sourceUrl: `${MINHAJI}/35739` },
      ],
    },
  ],
};

export const IMPORTED_OUTLINES: ImportedBookOutline[] = [G5_MATH_S1, G5_MATH_S2, G6_MATH];

/** إحصاءات كتاب مستورد واحد. */
export function outlineStats(outline: ImportedBookOutline) {
  const lessons = outline.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  return { units: outline.units.length, lessons };
}

/** الكتاب المستورد المطابق لصف/مادة/فصل، أو undefined. */
export function outlineFor(gradeNumber: number, subjectTitle: string, semester: 1 | 2) {
  const title = subjectTitle.trim();
  const candidates = IMPORTED_OUTLINES.filter(
    (outline) => outline.gradeNumber === gradeNumber && outline.subjectTitle.trim() === title,
  );
  const verified = candidates.find(
    (outline) => outline.semesterVerified && outline.semester === semester,
  );
  if (verified) return verified;
  // كتاب لم يُثبت المصدر تقسيمه: يُعرض كما ورد بدل نسبته إلى فصل غير مؤكد.
  return candidates.find((outline) => !outline.semesterVerified);
}

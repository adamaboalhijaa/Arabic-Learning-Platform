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
  /** معرّف المادة في السجل عندما يتكرر العنوان (رياضيات علمي/أدبي). */
  subjectId?: number;
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

/**
 * رياضيات الصف السابع — وحدات ودروس المادة كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G7_MATH: ImportedBookOutline = {
  key: 'g7-math',
  gradeNumber: 7,
  subjectTitle: 'الرياضيات',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/1071`,
  verifiedBy: 'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة الرياضيات للصف السابع في المصدر.',
  units: [
    {
      number: 1,
      title: 'الأعداد النسبية',
      lessons: [
        { title: 'العدد النسبي', sourceUrl: `${MINHAJI}/22109` },
        { title: 'كتابة العدد النسبي بالصورة العشرية', sourceUrl: `${MINHAJI}/22413` },
        { title: 'مقارنة الأعداد النسبية وترتيبها', sourceUrl: `${MINHAJI}/22416` },
        { title: 'جمع الأعداد النسبية وطرحها', sourceUrl: `${MINHAJI}/22418` },
        { title: 'ضرب الأعداد النسبية وقسمتها', sourceUrl: `${MINHAJI}/22420` },
        { title: 'الحل العكسي', sourceUrl: `${MINHAJI}/22499` },
      ],
    },
    {
      number: 2,
      title: 'الأسس الصحيحة والمقادير الجبرية',
      lessons: [
        { title: 'قوانين الأسس الصحيحة', sourceUrl: `${MINHAJI}/22375` },
        { title: 'أولويات العمليات الحسابية', sourceUrl: `${MINHAJI}/22377` },
        { title: 'الحدود والمقادير الجبرية', sourceUrl: `${MINHAJI}/16858` },
        { title: 'جمع المقادير الجبرية وطرحها', sourceUrl: `${MINHAJI}/17428` },
        { title: 'ضرب المقادير الجبرية', sourceUrl: `${MINHAJI}/17431` },
        { title: 'حالات خاصة من ضرب المقادير الجبرية', sourceUrl: `${MINHAJI}/22379` },
      ],
    },
    {
      number: 3,
      title: 'المعادلات الخطية',
      lessons: [
        { title: 'حل المعادلات', sourceUrl: `${MINHAJI}/15222` },
        { title: 'الكسور العشرية الدورية', sourceUrl: `${MINHAJI}/15275` },
        { title: 'المتتاليات', sourceUrl: `${MINHAJI}/15277` },
        { title: 'الاقترانات', sourceUrl: `${MINHAJI}/15280` },
        { title: 'تمثيل الاقتران الخطي بيانياً', sourceUrl: `${MINHAJI}/15295` },
      ],
    },
    {
      number: 4,
      title: 'الزوايا والمضلعات والتحويلات الهندسية',
      lessons: [
        { title: 'العلاقات بين الزوايا', sourceUrl: `${MINHAJI}/14046` },
        { title: 'المستقيمات المتوازية والقاطع', sourceUrl: `${MINHAJI}/17426` },
        { title: 'زوايا المثلث', sourceUrl: `${MINHAJI}/22673` },
        { title: 'زوايا المضلع', sourceUrl: `${MINHAJI}/22739` },
        { title: 'الدوران', sourceUrl: `${MINHAJI}/22743` },
      ],
    },
    {
      number: 5,
      title: 'التناسب وتطبيقاته',
      lessons: [
        { title: 'معدل الوحدة', sourceUrl: `${MINHAJI}/15557` },
        { title: 'التناسب', sourceUrl: `${MINHAJI}/23537` },
        { title: 'العلاقات التناسبية', sourceUrl: `${MINHAJI}/23540` },
        { title: 'التناسب الطردي', sourceUrl: `${MINHAJI}/23543` },
        { title: 'التناسب العكسي', sourceUrl: `${MINHAJI}/23589` },
        { title: 'التقسيم التناسبي', sourceUrl: `${MINHAJI}/23593` },
        { title: 'تطبيقات مالية', sourceUrl: `${MINHAJI}/23596` },
      ],
    },
    {
      number: 6,
      title: 'التطابق والتشابه',
      lessons: [
        { title: 'التطابق', sourceUrl: `${MINHAJI}/17382` },
        { title: 'مقياس الرسم', sourceUrl: `${MINHAJI}/17385` },
        { title: 'التشابه', sourceUrl: `${MINHAJI}/17388` },
        { title: 'التكبير', sourceUrl: `${MINHAJI}/17391` },
        { title: 'خطة حل المسألة: الرسم', sourceUrl: `${MINHAJI}/17394` },
      ],
    },
    {
      number: 7,
      title: 'المساحات والحجوم',
      lessons: [
        { title: 'محيط الدائرة', sourceUrl: `${MINHAJI}/15570` },
        { title: 'مساحة الدائرة', sourceUrl: `${MINHAJI}/29109` },
        { title: 'حجم المنشور والأسطوانة', sourceUrl: `${MINHAJI}/29115` },
        { title: 'حجم الهرم والمخروط', sourceUrl: `${MINHAJI}/35624` },
        { title: 'مساحة سطح المنشور والأسطوانة', sourceUrl: `${MINHAJI}/35631` },
        { title: 'مساحة سطح الهرم والمخروط', sourceUrl: `${MINHAJI}/35642` },
      ],
    },
    {
      number: 8,
      title: 'الإحصاء والاحتمالات',
      lessons: [
        { title: 'الوسط الحسابي', sourceUrl: `${MINHAJI}/17317` },
        { title: 'الوسيط والمنوال', sourceUrl: `${MINHAJI}/17323` },
        { title: 'التمثيل بالساق والورقة', sourceUrl: `${MINHAJI}/17562` },
      ],
    },
  ],
};

/**
 * رياضيات الصف الثامن — وحدات ودروس المادة كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G8_MATH: ImportedBookOutline = {
  key: 'g8-math',
  gradeNumber: 8,
  subjectTitle: 'الرياضيات',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/1081`,
  verifiedBy: 'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة الرياضيات للصف الثامن في المصدر.',
  units: [
    {
      number: 1,
      title: 'الأعداد الحقيقية',
      lessons: [
        { title: 'الجذور التربيعية', sourceUrl: `${MINHAJI}/14867` },
        { title: 'الجذور الصماء', sourceUrl: `${MINHAJI}/14945` },
        { title: 'نظرية فيثاغورس', sourceUrl: `${MINHAJI}/15018` },
        { title: 'الأعداد الحقيقية', sourceUrl: `${MINHAJI}/15089` },
        { title: 'النسبة المئوية', sourceUrl: `${MINHAJI}/24893` },
      ],
    },
    {
      number: 2,
      title: 'تحليل المقادير الجبرية',
      lessons: [
        { title: 'التحليل بإخراج العامل المشترك الأكبر', sourceUrl: `${MINHAJI}/15248` },
        { title: 'تحليل ثلاثيات الحدود - 1', sourceUrl: `${MINHAJI}/15231` },
        { title: 'تحليل ثلاثيات الحدود - 2', sourceUrl: `${MINHAJI}/15243` },
        { title: 'حالات خاصة من التحليل', sourceUrl: `${MINHAJI}/15232` },
      ],
    },
    {
      number: 3,
      title: 'المعادلات الخطية بمتغيرين',
      lessons: [
        { title: 'المعادلة الخطية بالصورة القياسية', sourceUrl: `${MINHAJI}/15241` },
        { title: 'ميل المستقيم', sourceUrl: `${MINHAJI}/17577` },
        { title: 'معادلة المستقيم بصيغة الميل والمقطع', sourceUrl: `${MINHAJI}/34762` },
        { title: 'معادلة المستقيم بصيغة الميل ونقطة', sourceUrl: `${MINHAJI}/34767` },
        { title: 'المستقيمات المتوازية والمتعامدة', sourceUrl: `${MINHAJI}/34773` },
      ],
    },
    {
      number: 4,
      title: 'المثلثات المتطابقة',
      lessons: [
        { title: 'تطابق المثلثات (SSS,SAS,HL)', sourceUrl: `${MINHAJI}/13949` },
        { title: 'تطابق المثلثات (ASA,AAS)', sourceUrl: `${MINHAJI}/13992` },
        { title: 'المثلثات المتطابقة الضلعين', sourceUrl: `${MINHAJI}/13858` },
      ],
    },
    {
      number: 5,
      title: 'المتباينات الخطية',
      lessons: [
        { title: 'كتابة المتباينات وتمثيلها', sourceUrl: `${MINHAJI}/16852` },
        { title: 'حل المتباينات بالجمع والطرح', sourceUrl: `${MINHAJI}/16907` },
        { title: 'حل المتباينات بالضرب والقسمة', sourceUrl: `${MINHAJI}/17402` },
        { title: 'حل المتباينات متعددة الخطوات', sourceUrl: `${MINHAJI}/17572` },
      ],
    },
    {
      number: 6,
      title: 'أنظمة المعادلات الخطية',
      lessons: [
        { title: 'حل نظام معادلتين خطيتين بيانياً', sourceUrl: `${MINHAJI}/13994` },
        { title: 'حل نظام معادلتين خطيتين بالتعويض', sourceUrl: `${MINHAJI}/14030` },
        { title: 'حل نظام معادلتين خطيتين بالحذف', sourceUrl: `${MINHAJI}/17617` },
      ],
    },
    {
      number: 7,
      title: 'الأشكال ثنائية الأبعاد',
      lessons: [
        { title: 'إثبات توازي المستقيمات وتعامدها', sourceUrl: `${MINHAJI}/17625` },
        { title: 'متوازي الأضلاع', sourceUrl: `${MINHAJI}/17639` },
        { title: 'تمييز متوازي الأضلاع', sourceUrl: `${MINHAJI}/17650` },
        { title: 'حالات خاصة من متوازي الأضلاع', sourceUrl: `${MINHAJI}/17673` },
        { title: 'تشابه المثلثات', sourceUrl: `${MINHAJI}/26730` },
        { title: 'التمدد', sourceUrl: `${MINHAJI}/26652` },
      ],
    },
    {
      number: 8,
      title: 'الأشكال ثلاثية الأبعاد',
      lessons: [
        { title: 'رسم الأشكال ثلاثية الأبعاد', sourceUrl: `${MINHAJI}/26657` },
        { title: 'المقاطع والمجسمات الدورانية', sourceUrl: `${MINHAJI}/26721` },
        { title: 'حجم الكرة ومساحة سطحها', sourceUrl: `${MINHAJI}/26725` },
      ],
    },
    {
      number: 9,
      title: 'الإحصاء والاحتمالات',
      lessons: [
        { title: 'الربيعيات', sourceUrl: `${MINHAJI}/19502` },
        { title: 'اختيار التمثيل الأنسب', sourceUrl: `${MINHAJI}/19505` },
      ],
    },
  ],
};

/**
 * رياضيات الصف التاسع — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * المصدر يعرض الوحدات بأرقامها (1، 2، 3، 6، 7، 8) دون الوحدتين 4 و5،
 * لذا سُجّلت الأرقام كما وردت ولم تُخترع وحدتان ناقصتان.
 */
const G9_MATH: ImportedBookOutline = {
  key: 'g9-math',
  gradeNumber: 9,
  subjectTitle: 'الرياضيات',
  subjectId: 1181,
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/1095`,
  verifiedBy:
    'أسماء الوحدات والدروس وأرقامها مأخوذة حرفيًا من صفحة مادة الرياضيات للصف التاسع في المصدر؛ تقسيم الفصل الدراسي غير مثبت لأن صفحات تنزيل الكتاب تعيد HTML لا PDF.',
  units: [
    {
      number: 1,
      title: 'المتباينات الخطية',
      lessons: [
        { title: 'المجموعات والفترات', sourceUrl: `${MINHAJI}/33639` },
        { title: 'حل المتباينات المركبة', sourceUrl: `${MINHAJI}/33899` },
        {
          title: 'حل معادلات القيمة المطلقة ومتبايناتها',
          sourceUrl: `${MINHAJI}/33908`,
        },
        {
          title: 'تمثيل المتباينات الخطية بمتغيرين بيانياً',
          sourceUrl: `${MINHAJI}/129590`,
        },
      ],
    },
    {
      number: 2,
      title: 'العلاقات والاقترانات',
      lessons: [
        { title: 'الاقترانات', sourceUrl: `${MINHAJI}/34037` },
        { title: 'تفسير التمثيلات البيانية', sourceUrl: `${MINHAJI}/34195` },
        { title: 'الاقتران التربيعي', sourceUrl: `${MINHAJI}/34332` },
        {
          title: 'التحويلات الهندسية للاقترانات التربيعية',
          sourceUrl: `${MINHAJI}/130010`,
        },
      ],
    },
    {
      number: 3,
      title: 'حل المعادلات',
      lessons: [
        {
          title: 'حل المعادلات التربيعية بيانياً',
          sourceUrl: `${MINHAJI}/34383`,
        },
        { title: 'حل المعادلات التربيعية بالتحليل', sourceUrl: `${MINHAJI}/34387` },
        {
          title: 'حل المعادلات التربيعية بإكمال المربع',
          sourceUrl: `${MINHAJI}/34691`,
        },
        {
          title: 'حل المعادلات التربيعية باستخدام القانون العام',
          sourceUrl: `${MINHAJI}/34700`,
        },
      ],
    },
    {
      number: 6,
      title: 'المقادير الأسية والمقادير الجذرية',
      lessons: [
        { title: 'تبسيط المقادير الأسية', sourceUrl: `${MINHAJI}/35759` },
        { title: 'العمليات على المقادير الجذرية', sourceUrl: `${MINHAJI}/35764` },
        { title: 'حل المعادلات الجذرية', sourceUrl: `${MINHAJI}/35769` },
      ],
    },
    {
      number: 7,
      title: 'المقادير الجبرية النسبية',
      lessons: [
        {
          title: 'ضرب المقادير الجبرية النسبية وقسمتها',
          sourceUrl: `${MINHAJI}/35774`,
        },
        {
          title: 'جمع المقادير الجبرية النسبية وطرحها',
          sourceUrl: `${MINHAJI}/35778`,
        },
        { title: 'حل المعادلات النسبية', sourceUrl: `${MINHAJI}/35781` },
      ],
    },
    {
      number: 8,
      title: 'الإحصاء والاحتمالات',
      lessons: [{ title: 'مقاييس التشتت', sourceUrl: `${MINHAJI}/35786` }],
    },
  ],
};

/**
 * رياضيات الصف الحادي عشر (المسار العلمي) — كما وردت في صفحة المادة بالمصدر.
 * الصفحة تعرض وحدتين فقط، فلم تُستكمل وحدات أخرى من خارج المصدر.
 */
const G11_MATH: ImportedBookOutline = {
  key: 'g11-math',
  gradeNumber: 11,
  subjectTitle: 'الرياضيات',
  subjectId: 1224,
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات (المسار العلمي)',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/8834`,
  verifiedBy:
    'أسماء الوحدتين ودروسهما مأخوذة حرفيًا من صفحة مادة الرياضيات للصف الحادي عشر (علمي) في المصدر؛ الصفحة تعرض وحدتين فقط، وتقسيم الفصل الدراسي غير مثبت.',
  units: [
    {
      number: 1,
      title: 'الاقترانات والمتتاليات والمتسلسلات',
      lessons: [
        { title: 'الاقترانات المتشعبة', sourceUrl: `${MINHAJI}/33852` },
        { title: 'التحويلات الهندسية للاقترانات', sourceUrl: `${MINHAJI}/33942` },
        { title: 'المتتاليات والمتسلسلات', sourceUrl: `${MINHAJI}/33988` },
      ],
    },
    {
      number: 2,
      title: 'النهايات والمشتقات',
      lessons: [{ title: 'النهايات والاتصال', sourceUrl: `${MINHAJI}/34012` }],
    },
  ],
};

/**
 * رياضيات الصف الثاني عشر (المسار الأكاديمي) — الصفحة تعرض عنوان وحدة واحدة بلا دروس مسماة،
 * لذا سُجّلت الوحدة بعنوانها فقط دون اختراع دروس.
 */
const G12_MATH: ImportedBookOutline = {
  key: 'g12-math',
  gradeNumber: 12,
  subjectTitle: 'الرياضيات',
  subjectId: 1244,
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات (المسار الأكاديمي)',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/55558`,
  verifiedBy:
    'عنوان الوحدة مأخوذ حرفيًا من صفحة مادة الرياضيات للصف الثاني عشر (المسار الأكاديمي) في المصدر؛ الصفحة تعرض الوحدة الأولى «المصفوفات» دون روابط دروس، فلم تُضف دروس من خارج المصدر.',
  units: [
    {
      number: 1,
      title: 'المصفوفات',
      lessons: [],
    },
  ],
};

export const IMPORTED_OUTLINES: ImportedBookOutline[] = [
  G5_MATH_S1,
  G5_MATH_S2,
  G6_MATH,
  G7_MATH,
  G8_MATH,
  G9_MATH,
  G11_MATH,
  G12_MATH,
];

/** إحصاءات كتاب مستورد واحد. */
export function outlineStats(outline: ImportedBookOutline) {
  const lessons = outline.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  return { units: outline.units.length, lessons };
}

/** الكتاب المستورد المطابق لصف/مادة/فصل، أو undefined. */
export function outlineFor(
  gradeNumber: number,
  subjectTitle: string,
  semester: 1 | 2,
  subjectId?: number,
) {
  const title = subjectTitle.trim();
  const candidates = IMPORTED_OUTLINES.filter(
    (outline) =>
      outline.gradeNumber === gradeNumber &&
      outline.subjectTitle.trim() === title &&
      (outline.subjectId === undefined ||
        subjectId === undefined ||
        outline.subjectId === subjectId),
  );
  const verified = candidates.find(
    (outline) => outline.semesterVerified && outline.semester === semester,
  );
  if (verified) return verified;
  // كتاب لم يُثبت المصدر تقسيمه: يُعرض كما ورد بدل نسبته إلى فصل غير مؤكد.
  return candidates.find((outline) => !outline.semesterVerified);
}

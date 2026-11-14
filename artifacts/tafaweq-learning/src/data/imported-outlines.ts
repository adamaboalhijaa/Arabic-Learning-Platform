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
 * رياضيات الصف الثاني — وحدات ودروس المادة كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G2_MATH: ImportedBookOutline = {
  key: 'g2-math',
  gradeNumber: 2,
  subjectTitle: 'الرياضيات',
  subjectId: 1041,
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/72`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة الرياضيات للصف الثاني في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'الأعداد',
      lessons: [
        { title: 'المئات', sourceUrl: `${MINHAJI}/24263` },
        { title: 'الأعداد ضمن ثلاث منازل', sourceUrl: `${MINHAJI}/24266` },
        { title: 'القيمة المنزلية', sourceUrl: `${MINHAJI}/24373` },
        { title: 'قراءة الأعداد وكتابتها', sourceUrl: `${MINHAJI}/24376` },
      ],
    },
    {
      number: 2,
      title: 'ترتيب الأعداد ومقارنتها',
      lessons: [
        { title: 'العد بالواحدات والعشرات والمئات', sourceUrl: `${MINHAJI}/24270` },
        { title: 'الأعداد الزوجية والأعداد الفردية', sourceUrl: `${MINHAJI}/24272` },
        { title: 'العدد السابق والعدد التالي', sourceUrl: `${MINHAJI}/24276` },
        { title: 'مقارنة الأعداد', sourceUrl: `${MINHAJI}/24384` },
        { title: 'ترتيب الأعداد', sourceUrl: `${MINHAJI}/24387` },
        { title: 'تقريب الأعداد', sourceUrl: `${MINHAJI}/24389` },
      ],
    },
    {
      number: 3,
      title: 'الجمع',
      lessons: [
        { title: 'جمع مضاعفات العشرة والمئة ذهنياً', sourceUrl: `${MINHAJI}/24280` },
        { title: 'الجمع الذهني', sourceUrl: `${MINHAJI}/24282` },
        { title: 'الجمع', sourceUrl: `${MINHAJI}/24284` },
        { title: 'الجمع مع إعادة التجميع (1)', sourceUrl: `${MINHAJI}/24400` },
        { title: 'الجمع مع إعادة التجميع (2)', sourceUrl: `${MINHAJI}/25531` },
        { title: 'خصائص الجمع', sourceUrl: `${MINHAJI}/25534` },
        { title: 'تقدير ناتج الجمع', sourceUrl: `${MINHAJI}/25537` },
        { title: 'التخمين والتحقق', sourceUrl: `${MINHAJI}/25540` },
      ],
    },
    {
      number: 4,
      title: 'الطرح',
      lessons: [
        { title: 'طرح مضاعفات العشرة والمئة ذهنياً', sourceUrl: `${MINHAJI}/24290` },
        { title: 'الطرح الذهني', sourceUrl: `${MINHAJI}/24292` },
      ],
    },
    {
      number: 5,
      title: 'معالجة البيانات',
      lessons: [
        { title: 'تمثيل البيانات بالصور', sourceUrl: `${MINHAJI}/24295` },
        { title: 'تفسير البيانات الممثلة بالصور', sourceUrl: `${MINHAJI}/24298` },
        { title: 'جمع البيانات وتنظيمها', sourceUrl: `${MINHAJI}/24300` },
        { title: 'تفسير البيانات بجدول الإشارات', sourceUrl: `${MINHAJI}/25523` },
      ],
    },
    {
      number: 6,
      title: 'الضرب',
      lessons: [
        { title: 'المجموعات المتساوية', sourceUrl: `${MINHAJI}/24202` },
        { title: 'الضرب كجمع متكرر', sourceUrl: `${MINHAJI}/24205` },
        { title: 'الشبكات والضرب', sourceUrl: `${MINHAJI}/24208` },
        { title: 'الضرب في 2', sourceUrl: `${MINHAJI}/24211` },
        { title: 'الضرب في 5', sourceUrl: `${MINHAJI}/24213` },
        { title: 'الضرب في 3', sourceUrl: `${MINHAJI}/24215` },
        { title: 'الضرب في 4', sourceUrl: `${MINHAJI}/24217` },
        { title: 'أبحث عن نمط', sourceUrl: `${MINHAJI}/24219` },
      ],
    },
    {
      number: 7,
      title: 'القسمة',
      lessons: [
        { title: 'تكوين المجموعات المتساوية', sourceUrl: `${MINHAJI}/24230` },
        { title: 'القسمة كطرح متكرر', sourceUrl: `${MINHAJI}/24233` },
        { title: 'العلاقة بين القسمة والضرب', sourceUrl: `${MINHAJI}/24239` },
        { title: 'القسمة على 2', sourceUrl: `${MINHAJI}/24242` },
        { title: 'القسمة على 5', sourceUrl: `${MINHAJI}/24246` },
        { title: 'القسمة على 3', sourceUrl: `${MINHAJI}/24248` },
        { title: 'القسمة على 4', sourceUrl: `${MINHAJI}/24250` },
        { title: 'اختيار العملية', sourceUrl: `${MINHAJI}/24252` },
      ],
    },
    {
      number: 8,
      title: 'الكسور والأشكال الهندسية',
      lessons: [
        { title: 'كسر الوحدة', sourceUrl: `${MINHAJI}/24304` },
        { title: 'كسر الوحدة كجزء من مجموعة', sourceUrl: `${MINHAJI}/24307` },
        { title: 'المجسمات', sourceUrl: `${MINHAJI}/24309` },
        { title: 'الأحرف والأوجه والرؤوس', sourceUrl: `${MINHAJI}/24312` },
        { title: 'الأشكال المستوية', sourceUrl: `${MINHAJI}/24315` },
        { title: 'الأضلاع والرؤوس', sourceUrl: `${MINHAJI}/24365` },
        { title: 'الأنماط الهندسية', sourceUrl: `${MINHAJI}/24367` },
      ],
    },
    {
      number: 9,
      title: 'الزمن والنقود',
      lessons: [
        { title: 'أشهر السنة', sourceUrl: `${MINHAJI}/24338` },
        { title: 'الوقت لأقرب 5 دقائق', sourceUrl: `${MINHAJI}/24341` },
        { title: 'الوقت لأقرب ربع ساعة', sourceUrl: `${MINHAJI}/24343` },
        { title: 'الدينار', sourceUrl: `${MINHAJI}/24346` },
        { title: 'فئات النقود الورقية', sourceUrl: `${MINHAJI}/24349` },
      ],
    },
    {
      number: 10,
      title: 'القياس',
      lessons: [
        { title: 'السنتيمتر', sourceUrl: `${MINHAJI}/24319` },
        { title: 'المتر', sourceUrl: `${MINHAJI}/24322` },
        { title: 'الغرام والكيلوغرام', sourceUrl: `${MINHAJI}/24325` },
        { title: 'اللتر والمليلتر', sourceUrl: `${MINHAJI}/24328` },
      ],
    },
  ],
};

/**
 * رياضيات الصف الثالث — الوحدات والدروس كما وردت في المصدر.
 * المصدر يعرض الوحدات بأرقام 1، 2، 3، 7، 8، 9، 10، 11 دون الوحدات 4–6،
 * لذا سُجّلت الأرقام كما وردت ولم تُخترع وحدات ناقصة.
 */
const G3_MATH: ImportedBookOutline = {
  key: 'g3-math',
  gradeNumber: 3,
  subjectTitle: 'الرياضيات',
  subjectId: 1061,
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/101`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة الرياضيات للصف الثالث في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'الأعداد',
      lessons: [
        { title: 'الألوف', sourceUrl: `${MINHAJI}/27419` },
        { title: 'القيمة المنزلية ضمن الألوف', sourceUrl: `${MINHAJI}/27423` },
        { title: 'مقارنة الأعداد', sourceUrl: `${MINHAJI}/27427` },
        { title: 'ترتيب الأعداد', sourceUrl: `${MINHAJI}/27430` },
        { title: 'تقريب الأعداد', sourceUrl: `${MINHAJI}/27433` },
        { title: 'العد القفزي', sourceUrl: `${MINHAJI}/27437` },
        { title: 'الأرقام الهندية', sourceUrl: `${MINHAJI}/27440` },
      ],
    },
    {
      number: 2,
      title: 'الجمع',
      lessons: [
        { title: 'جمع مضاعفات 10 و100 و1000', sourceUrl: `${MINHAJI}/27445` },
        { title: 'الجمع الذهني', sourceUrl: `${MINHAJI}/27698` },
        { title: 'تقدير ناتج الجمع', sourceUrl: `${MINHAJI}/27703` },
      ],
    },
    {
      number: 3,
      title: 'الطرح',
      lessons: [
        { title: 'طرح مضاعفات 10 و100 و1000', sourceUrl: `${MINHAJI}/34302` },
        { title: 'الطرح الذهني', sourceUrl: `${MINHAJI}/34306` },
        { title: 'تقدير ناتج الطرح', sourceUrl: `${MINHAJI}/34310` },
      ],
    },
    {
      number: 7,
      title: 'الضرب في عدد من منزلة واحدة',
      lessons: [
        { title: 'الضرب في مضاعفات العدد 10', sourceUrl: `${MINHAJI}/26045` },
        { title: 'تقدير ناتج الضرب', sourceUrl: `${MINHAJI}/26048` },
        { title: 'الضرب باستعمال خاصية التوزيع', sourceUrl: `${MINHAJI}/26051` },
        { title: 'الضرب من دون إعادة التجميع', sourceUrl: `${MINHAJI}/26055` },
        { title: 'الضرب مع إعادة التجميع', sourceUrl: `${MINHAJI}/26058` },
      ],
    },
    {
      number: 8,
      title: 'القسمة على عدد من منزلة واحدة',
      lessons: [
        { title: 'قسمة مضاعفات العدد 10', sourceUrl: `${MINHAJI}/26179` },
        { title: 'تقدير ناتج القسمة', sourceUrl: `${MINHAJI}/26182` },
        { title: 'القسمة من دون باق', sourceUrl: `${MINHAJI}/26186` },
        { title: 'القسمة مع باق', sourceUrl: `${MINHAJI}/26249` },
      ],
    },
    {
      number: 9,
      title: 'الكسور',
      lessons: [
        { title: 'الكسر كجزء من كل', sourceUrl: `${MINHAJI}/26266` },
        { title: 'الكسر كجزء من مجموعة', sourceUrl: `${MINHAJI}/26270` },
        { title: 'الكسور المساوية للواحد', sourceUrl: `${MINHAJI}/26273` },
        { title: 'الكسور على خط الأعداد', sourceUrl: `${MINHAJI}/26282` },
        { title: 'الكسور المكافئة', sourceUrl: `${MINHAJI}/26285` },
        { title: 'مقارنة الكسور', sourceUrl: `${MINHAJI}/26289` },
        { title: 'ترتيب الكسور', sourceUrl: `${MINHAJI}/26292` },
        { title: 'الكسور والقسمة', sourceUrl: `${MINHAJI}/26295` },
      ],
    },
    {
      number: 10,
      title: 'الزمن',
      lessons: [
        { title: 'الوقت بالدقائق', sourceUrl: `${MINHAJI}/26299` },
        { title: 'قراءة الوقت باستعمال (و، إلا)', sourceUrl: `${MINHAJI}/26303` },
        { title: 'قبل الظهر، بعد الظهر', sourceUrl: `${MINHAJI}/26317` },
        { title: 'الفترات الزمنية (1)', sourceUrl: `${MINHAJI}/26321` },
        { title: 'الفترات الزمنية (2)', sourceUrl: `${MINHAJI}/26325` },
        { title: 'التقويم', sourceUrl: `${MINHAJI}/26328` },
      ],
    },
    {
      number: 11,
      title: 'الهندسة والقياس',
      lessons: [
        { title: 'المتر والسنتيمتر', sourceUrl: `${MINHAJI}/26388` },
        { title: 'الكيلومتر', sourceUrl: `${MINHAJI}/26393` },
        { title: 'الغرام والكيلوغرام', sourceUrl: `${MINHAJI}/26398` },
      ],
    },
  ],
};

/**
 * رياضيات الصف الرابع — وحدات ودروس المادة كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G4_MATH: ImportedBookOutline = {
  key: 'g4-math',
  gradeNumber: 4,
  subjectTitle: 'الرياضيات',
  subjectId: 1081,
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — الرياضيات',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/148`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة الرياضيات للصف الرابع في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'الأعداد جمعها وطرحها',
      lessons: [
        { title: 'القيمة المنزلية ضمن مئات الألوف', sourceUrl: `${MINHAJI}/22391` },
        { title: 'مقارنة الأعداد وترتيبها', sourceUrl: `${MINHAJI}/22435` },
        { title: 'تقريب الأعداد', sourceUrl: `${MINHAJI}/22446` },
        { title: 'تقدير المجموع والفرق', sourceUrl: `${MINHAJI}/22449` },
        { title: 'جمع الأعداد', sourceUrl: `${MINHAJI}/22451` },
        { title: 'طرح الأعداد', sourceUrl: `${MINHAJI}/22454` },
      ],
    },
    {
      number: 2,
      title: 'الضرب',
      lessons: [
        { title: 'الضرب في مضاعفات 10', sourceUrl: `${MINHAJI}/18717` },
        { title: 'تقدير نواتج الضرب', sourceUrl: `${MINHAJI}/18888` },
        { title: 'الضرب في عدد من منزلة واحدة', sourceUrl: `${MINHAJI}/18889` },
        { title: 'ضرب عدد من منزلتين', sourceUrl: `${MINHAJI}/18897` },
        { title: 'خطة حل المسألة', sourceUrl: `${MINHAJI}/22388` },
      ],
    },
    {
      number: 3,
      title: 'القسمة',
      lessons: [
        { title: 'قسمة مضاعفات 10 و100 و1000', sourceUrl: `${MINHAJI}/15251` },
        { title: 'تقدير ناتج القسمة', sourceUrl: `${MINHAJI}/15254` },
        { title: 'القسمة من دون باق', sourceUrl: `${MINHAJI}/22393` },
        { title: 'القسمة مع باق', sourceUrl: `${MINHAJI}/22395` },
        { title: 'القسمة مع وجود أصفار في الناتج', sourceUrl: `${MINHAJI}/22397` },
        { title: 'أولويات العمليات', sourceUrl: `${MINHAJI}/22399` },
      ],
    },
    {
      number: 4,
      title: 'خصائص الأعداد',
      lessons: [
        { title: 'قابلية القسمة على 2 و3 و5 و10', sourceUrl: `${MINHAJI}/25121` },
      ],
    },
    {
      number: 5,
      title: 'الهندسة',
      lessons: [
        { title: 'تصنيف الزوايا', sourceUrl: `${MINHAJI}/22780` },
        { title: 'المستقيمات المتوازية والمتقاطعة', sourceUrl: `${MINHAJI}/22783` },
        { title: 'قياس الزوايا ورسمها', sourceUrl: `${MINHAJI}/22787` },
      ],
    },
    {
      number: 6,
      title: 'الكسور',
      lessons: [
        { title: 'الكسور المتكافئة', sourceUrl: `${MINHAJI}/23849` },
        { title: 'جمع الكسور المتشابهة وطرحها', sourceUrl: `${MINHAJI}/23852` },
        { title: 'الأعداد الكسرية والكسور غير الفعلية', sourceUrl: `${MINHAJI}/23855` },
        { title: 'تقريب الكسور والأعداد الكسرية', sourceUrl: `${MINHAJI}/24034` },
        { title: 'مقارنة الكسور وترتيبها', sourceUrl: `${MINHAJI}/24038` },
      ],
    },
    {
      number: 7,
      title: 'الكسور العشرية',
      lessons: [
        { title: 'أجزاء العشرة', sourceUrl: `${MINHAJI}/23813` },
        { title: 'أجزاء المئة', sourceUrl: `${MINHAJI}/23817` },
        { title: 'الأعداد العشرية', sourceUrl: `${MINHAJI}/23821` },
        { title: 'التحويل بين الكسور العادية والكسور العشرية', sourceUrl: `${MINHAJI}/23824` },
        { title: 'مقارنة الأعداد العشرية وترتيبها', sourceUrl: `${MINHAJI}/23826` },
        { title: 'تقريب الأعداد العشرية', sourceUrl: `${MINHAJI}/23829` },
      ],
    },
    {
      number: 8,
      title: 'الأنماط',
      lessons: [
        { title: 'الأنماط', sourceUrl: `${MINHAJI}/20444` },
        { title: 'جداول المدخلات والمخرجات', sourceUrl: `${MINHAJI}/20445` },
        { title: 'الأنماط الهندسية', sourceUrl: `${MINHAJI}/20446` },
        { title: 'المقادير والمتغيرات', sourceUrl: `${MINHAJI}/20482` },
        { title: 'المعادلات', sourceUrl: `${MINHAJI}/35671` },
      ],
    },
    {
      number: 9,
      title: 'القياس',
      lessons: [
        { title: 'وحدات قياس الطول', sourceUrl: `${MINHAJI}/23862` },
        { title: 'وحدات قياس الكتلة', sourceUrl: `${MINHAJI}/23869` },
        { title: 'وحدات قياس السعة', sourceUrl: `${MINHAJI}/23872` },
        { title: 'الزمن', sourceUrl: `${MINHAJI}/23859` },
        { title: 'المحيط', sourceUrl: `${MINHAJI}/23875` },
        { title: 'المساحة', sourceUrl: `${MINHAJI}/23878` },
      ],
    },
    {
      number: 10,
      title: 'الإحصاء والاحتمال',
      lessons: [
        { title: 'تمثيل البيانات بالنقاط', sourceUrl: `${MINHAJI}/23888` },
        { title: 'تمثيل البيانات بالأعمدة', sourceUrl: `${MINHAJI}/23891` },
        { title: 'تمثيل البيانات بأشكال فن', sourceUrl: `${MINHAJI}/23894` },
        { title: 'التجربة العشوائية وأنواع الحوادث', sourceUrl: `${MINHAJI}/23897` },
      ],
    },
  ],
};

/**
 * علوم الصف الأول — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * المصدر يعرض الوحدات 1، 2، 4 دون الثالثة، والأعداد سُجلت كما وردت.
 */
const G1_SCIENCE: ImportedBookOutline = {
  key: 'g1-science',
  gradeNumber: 1,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/20744`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف الأول في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'الإنسان والصحة',
      lessons: [
        { title: 'حاجات الإنسان الأساسية', sourceUrl: `${MINHAJI}/27334` },
        { title: 'صحة جسم الإنسان', sourceUrl: `${MINHAJI}/27342` },
      ],
    },
    {
      number: 2,
      title: 'النباتات والحيوانات',
      lessons: [{ title: 'النباتات وأجزاؤها', sourceUrl: `${MINHAJI}/132879` }],
    },
    {
      number: 4,
      title: 'الحركة والقوة',
      lessons: [{ title: 'الموقع والحركة', sourceUrl: `${MINHAJI}/32119` }],
    },
  ],
};

/**
 * علوم الصف الثاني — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G2_SCIENCE: ImportedBookOutline = {
  key: 'g2-science',
  gradeNumber: 2,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/65`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف الثاني في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'خصائص الكائنات الحية وصفاتها',
      lessons: [
        { title: 'خصائص الكائنات الحية', sourceUrl: `${MINHAJI}/24180` },
        { title: 'الكائنات الحية تورث صفاتها', sourceUrl: `${MINHAJI}/24187` },
      ],
    },
    {
      number: 2,
      title: 'تفاعل الكائنات الحية في البيئة',
      lessons: [
        { title: 'حاجات الكائنات الحية', sourceUrl: `${MINHAJI}/24196` },
        { title: 'تكيف الكائنات الحية', sourceUrl: `${MINHAJI}/25544` },
      ],
    },
    {
      number: 3,
      title: 'الأرض والشمس',
      lessons: [
        { title: 'كيف يتغير سطح الأرض؟', sourceUrl: `${MINHAJI}/25561` },
        { title: 'الشمس نجم قريب', sourceUrl: `${MINHAJI}/25568` },
      ],
    },
    {
      number: 4,
      title: 'جسم الإنسان وصحته',
      lessons: [
        { title: 'أعضاء جسم الإنسان', sourceUrl: `${MINHAJI}/24122` },
        { title: 'العادات الصحية', sourceUrl: `${MINHAJI}/24129` },
      ],
    },
    {
      number: 5,
      title: 'الصوت والضوء',
      lessons: [
        { title: 'الصوت وخصائصه', sourceUrl: `${MINHAJI}/24139` },
        { title: 'الضوء ومصادره', sourceUrl: `${MINHAJI}/24146` },
      ],
    },
    {
      number: 6,
      title: 'المادة',
      lessons: [
        { title: 'المادة وخصائصها', sourceUrl: `${MINHAJI}/24157` },
        { title: 'حالات المادة وتحولاتها', sourceUrl: `${MINHAJI}/24164` },
        { title: 'المادة والطاقة', sourceUrl: `${MINHAJI}/24169` },
      ],
    },
  ],
};

/**
 * علوم الصف الثالث — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * الوحدة الرابعة تظهر في المصدر بالدرس الثاني فقط، وسُجّلت كما وردت.
 */
const G3_SCIENCE: ImportedBookOutline = {
  key: 'g3-science',
  gradeNumber: 3,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/89`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف الثالث في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'الكائنات الحية',
      lessons: [
        { title: 'تكاثر الكائنات الحية ودورات حياتها', sourceUrl: `${MINHAJI}/24698` },
        { title: 'سلوك الكائنات الحية', sourceUrl: `${MINHAJI}/24758` },
        { title: 'الكائنات الحية في بيئاتها', sourceUrl: `${MINHAJI}/24765` },
      ],
    },
    {
      number: 2,
      title: 'المادة',
      lessons: [
        { title: 'المادة وحالاتها', sourceUrl: `${MINHAJI}/25485` },
        { title: 'المادة النقية والمخلوط', sourceUrl: `${MINHAJI}/25496` },
      ],
    },
    {
      number: 3,
      title: 'القوى والآلات البسيطة',
      lessons: [
        { title: 'قوة الجاذبية الأرضية', sourceUrl: `${MINHAJI}/24897` },
        { title: 'الآلات البسيطة', sourceUrl: `${MINHAJI}/24898` },
      ],
    },
    {
      number: 4,
      title: 'البيئة',
      lessons: [{ title: 'الأخطار الطبيعية', sourceUrl: `${MINHAJI}/24772` }],
    },
    {
      number: 5,
      title: 'الأرض ومكوناتها',
      lessons: [
        { title: 'الأرض', sourceUrl: `${MINHAJI}/25502` },
        { title: 'الأحافير', sourceUrl: `${MINHAJI}/25506` },
      ],
    },
    {
      number: 6,
      title: 'سلامة الإنسان وصحته',
      lessons: [
        { title: 'الأخطار من حولنا', sourceUrl: `${MINHAJI}/25995` },
        { title: 'كيف أتجنب الأخطار', sourceUrl: `${MINHAJI}/26000` },
      ],
    },
  ],
};

/**
 * علوم الصف الرابع — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * المصدر يعرض الوحدات 1، 2، 3، 4، 6، 7، 8، 9، 10 دون الخامسة، وسُجلت كما وردت.
 */
const G4_SCIENCE: ImportedBookOutline = {
  key: 'g4-science',
  gradeNumber: 4,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/145`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف الرابع في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'تصنيف الكائنات الحية',
      lessons: [
        { title: 'التصنيف', sourceUrl: `${MINHAJI}/160` },
        { title: 'ممالك الكائنات الحية', sourceUrl: `${MINHAJI}/164` },
      ],
    },
    {
      number: 2,
      title: 'دورات حياة الكائنات الحية والعلاقات بينها',
      lessons: [
        { title: 'تكاثر النباتات ودورات حياتها', sourceUrl: `${MINHAJI}/323` },
        { title: 'تكاثر الحيوانات ودورات حياتها', sourceUrl: `${MINHAJI}/324` },
        { title: 'العلاقات بين الكائنات الحية', sourceUrl: `${MINHAJI}/22913` },
      ],
    },
    {
      number: 3,
      title: 'جسم الإنسان وصحته',
      lessons: [
        { title: 'الحواس الخمس', sourceUrl: `${MINHAJI}/231` },
        { title: 'الصحة الجسمية والصحة النفسية والعاطفية', sourceUrl: `${MINHAJI}/232` },
      ],
    },
    {
      number: 4,
      title: 'المادة',
      lessons: [
        { title: 'خصائص المادة', sourceUrl: `${MINHAJI}/255` },
        { title: 'تغيرات المادة', sourceUrl: `${MINHAJI}/276` },
      ],
    },
    {
      number: 6,
      title: 'الضوء',
      lessons: [
        { title: 'خصائص الضوء', sourceUrl: `${MINHAJI}/20572` },
        { title: 'تكون الظلال', sourceUrl: `${MINHAJI}/20607` },
      ],
    },
    {
      number: 7,
      title: 'حركة الأرض',
      lessons: [
        { title: 'الليل والنهار', sourceUrl: `${MINHAJI}/341` },
        { title: 'الفصول الأربعة', sourceUrl: `${MINHAJI}/342` },
      ],
    },
    {
      number: 8,
      title: 'القوة والطاقة',
      lessons: [
        { title: 'القوة', sourceUrl: `${MINHAJI}/20847` },
        { title: 'الطاقة', sourceUrl: `${MINHAJI}/20848` },
      ],
    },
    {
      number: 9,
      title: 'الكهرباء',
      lessons: [
        { title: 'الدارات الكهربائية البسيطة', sourceUrl: `${MINHAJI}/292` },
        { title: 'المواد الموصلة والمواد العازلة', sourceUrl: `${MINHAJI}/293` },
      ],
    },
    {
      number: 10,
      title: 'الموارد الطبيعية في البيئة',
      lessons: [
        { title: 'الموارد الحيوية', sourceUrl: `${MINHAJI}/20837` },
        { title: 'الموارد غير الحيوية', sourceUrl: `${MINHAJI}/20839` },
      ],
    },
  ],
};

/**
 * علوم الصف الخامس — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G5_SCIENCE: ImportedBookOutline = {
  key: 'g5-science',
  gradeNumber: 5,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/956`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف الخامس في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'البيئة',
      lessons: [
        { title: 'مفاهيم النظام البيئي', sourceUrl: `${MINHAJI}/1171` },
        { title: 'أثر تغيرات البيئة في الأنظمة البيئية', sourceUrl: `${MINHAJI}/1206` },
      ],
    },
    {
      number: 2,
      title: 'تصنيف الكائنات الحية',
      lessons: [
        { title: 'مملكة النباتات', sourceUrl: `${MINHAJI}/996` },
        { title: 'مملكة الحيوانات', sourceUrl: `${MINHAJI}/1006` },
        { title: 'مملكة الفطريات', sourceUrl: `${MINHAJI}/22203` },
      ],
    },
    {
      number: 3,
      title: 'الموارد الطبيعية ومصادر الطاقة',
      lessons: [
        { title: 'الموارد الطبيعية', sourceUrl: `${MINHAJI}/1042` },
        { title: 'مصادر الطاقة', sourceUrl: `${MINHAJI}/1052` },
      ],
    },
    {
      number: 4,
      title: 'العناصر والمركبات الكيميائية',
      lessons: [
        { title: 'العناصر الكيميائية', sourceUrl: `${MINHAJI}/1019` },
        { title: 'المركبات الكيميائية', sourceUrl: `${MINHAJI}/1028` },
      ],
    },
    {
      number: 5,
      title: 'الضوء والصوت',
      lessons: [
        { title: 'الضوء وخصائصه', sourceUrl: `${MINHAJI}/1128` },
        { title: 'الصوت وخصائصه', sourceUrl: `${MINHAJI}/1141` },
      ],
    },
    {
      number: 6,
      title: 'الغذاء والصحة',
      lessons: [
        { title: 'مجموعات الغذاء', sourceUrl: `${MINHAJI}/23328` },
        { title: 'الغذاء المتوازن', sourceUrl: `${MINHAJI}/23333` },
      ],
    },
    {
      number: 7,
      title: 'أجهزة جسم الإنسان',
      lessons: [
        { title: 'الجهاز الهضمي والجهاز البولي', sourceUrl: `${MINHAJI}/964` },
        { title: 'الجهاز التنفسي وجهاز الدوران', sourceUrl: `${MINHAJI}/23339` },
        { title: 'الجهاز الهيكلي والجهاز العضلي', sourceUrl: `${MINHAJI}/981` },
      ],
    },
    {
      number: 8,
      title: 'المادة',
      lessons: [
        { title: 'الخصائص الفيزيائية للمواد', sourceUrl: `${MINHAJI}/23345` },
        { title: 'تحولات المادة', sourceUrl: `${MINHAJI}/23700` },
      ],
    },
    {
      number: 9,
      title: 'الحركة والطاقة',
      lessons: [
        { title: 'السرعة', sourceUrl: `${MINHAJI}/23709` },
        { title: 'الطاقة الميكانيكية', sourceUrl: `${MINHAJI}/23714` },
      ],
    },
    {
      number: 10,
      title: 'الأرض',
      lessons: [
        { title: 'مكونات الأرض', sourceUrl: `${MINHAJI}/23983` },
        { title: 'الأرصاد الجوية', sourceUrl: `${MINHAJI}/23988` },
      ],
    },
  ],
};

/**
 * علوم الصف السادس — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G6_SCIENCE: ImportedBookOutline = {
  key: 'g6-science',
  gradeNumber: 6,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/1053`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف السادس في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'من الخلية إلى الجسم',
      lessons: [
        { title: 'الخلية', sourceUrl: `${MINHAJI}/2355` },
        { title: 'نقل المواد والعمليات الحيوية في الخلية', sourceUrl: `${MINHAJI}/24685` },
        { title: 'مستويات التنظيم في الكائنات الحية', sourceUrl: `${MINHAJI}/2372` },
      ],
    },
    {
      number: 2,
      title: 'المادة',
      lessons: [
        { title: 'الذرات والجزيئات', sourceUrl: `${MINHAJI}/2395` },
        { title: 'الفلزات واللافلزات', sourceUrl: `${MINHAJI}/2414` },
      ],
    },
    {
      number: 3,
      title: 'الشغل والطاقة',
      lessons: [
        { title: 'الطاقة الميكانيكية', sourceUrl: `${MINHAJI}/2482` },
        { title: 'الآلات البسيطة', sourceUrl: `${MINHAJI}/2492` },
      ],
    },
    {
      number: 4,
      title: 'الإنسان والأرض',
      lessons: [
        { title: 'العمليات الجيولوجية المؤثرة في سطح الأرض', sourceUrl: `${MINHAJI}/2507` },
        { title: 'التلوث', sourceUrl: `${MINHAJI}/2518` },
      ],
    },
    {
      number: 5,
      title: 'البيئة',
      lessons: [
        { title: 'الأنظمة البيئية', sourceUrl: `${MINHAJI}/25314` },
        { title: 'الجماعات الحيوية', sourceUrl: `${MINHAJI}/25318` },
      ],
    },
    {
      number: 6,
      title: 'المخاليط وطرائق فصلها',
      lessons: [
        { title: 'المواد النقية والمخاليط', sourceUrl: `${MINHAJI}/25447` },
        { title: 'فصل المخاليط', sourceUrl: `${MINHAJI}/25451` },
      ],
    },
    {
      number: 7,
      title: 'الصوت',
      lessons: [
        { title: 'الموجات', sourceUrl: `${MINHAJI}/25460` },
        { title: 'الصوت والسمع', sourceUrl: `${MINHAJI}/25464` },
      ],
    },
    {
      number: 8,
      title: 'الحرارة',
      lessons: [
        { title: 'الحرارة وطرائق انتقالها', sourceUrl: `${MINHAJI}/2430` },
        { title: 'الحرارة في حياتنا', sourceUrl: `${MINHAJI}/2443` },
      ],
    },
    {
      number: 9,
      title: 'علوم الفضاء',
      lessons: [
        { title: 'المجرات', sourceUrl: `${MINHAJI}/2462` },
        { title: 'الفضاء والكون', sourceUrl: `${MINHAJI}/2472` },
      ],
    },
  ],
};

/**
 * علوم الصف السابع — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G7_SCIENCE: ImportedBookOutline = {
  key: 'g7-science',
  gradeNumber: 7,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/1063`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف السابع في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'الأرض',
      lessons: [
        { title: 'المعادن والصخور', sourceUrl: `${MINHAJI}/22091` },
        { title: 'العمر النسبي للصخور والعمر المطلق', sourceUrl: `${MINHAJI}/4288` },
      ],
    },
    {
      number: 2,
      title: 'الفلك وعلوم الفضاء',
      lessons: [
        { title: 'كواكب النظام الشمسي', sourceUrl: `${MINHAJI}/22169` },
        { title: 'الدورية في النظام الشمسي', sourceUrl: `${MINHAJI}/22177` },
      ],
    },
    {
      number: 3,
      title: 'تصنيف الكائنات الحية',
      lessons: [
        { title: 'علم التصنيف', sourceUrl: `${MINHAJI}/4226` },
        { title: 'مملكتا الحيوانات والنباتات', sourceUrl: `${MINHAJI}/4234` },
        { title: 'مملكتا الفطريات والطلائعيات', sourceUrl: `${MINHAJI}/22317` },
        { title: 'نطاقا البكتيريا والأثريات', sourceUrl: `${MINHAJI}/22551` },
      ],
    },
    {
      number: 4,
      title: 'المحاليل',
      lessons: [
        { title: 'الماء في حياتنا', sourceUrl: `${MINHAJI}/4156` },
        { title: 'الذائبية', sourceUrl: `${MINHAJI}/4172` },
      ],
    },
    {
      number: 5,
      title: 'القوة والحركة',
      lessons: [
        { title: 'وصف الحركة', sourceUrl: `${MINHAJI}/4199` },
        { title: 'القوى وتأثيرها في الأجسام', sourceUrl: `${MINHAJI}/4211` },
      ],
    },
    {
      number: 6,
      title: 'الحموض والقواعد',
      lessons: [
        { title: 'خصائص الحموض والقواعد', sourceUrl: `${MINHAJI}/4181` },
        { title: 'الكواشف والرقم الهيدروجيني', sourceUrl: `${MINHAJI}/4193` },
      ],
    },
    {
      number: 7,
      title: 'الضوء',
      lessons: [
        { title: 'الضوء مفهومه وخصائصه', sourceUrl: `${MINHAJI}/23316` },
        { title: 'تطبيقات على انعكاس الضوء', sourceUrl: `${MINHAJI}/23322` },
      ],
    },
    {
      number: 8,
      title: 'الكهرباء',
      lessons: [
        { title: 'الكهرباء الساكنة', sourceUrl: `${MINHAJI}/23349` },
        { title: 'الكهرباء المتحركة', sourceUrl: `${MINHAJI}/23354` },
      ],
    },
    {
      number: 9,
      title: 'السلوك والتكيف',
      lessons: [
        { title: 'سلوك الحيوانات', sourceUrl: `${MINHAJI}/4247` },
        { title: 'التكيف والانقراض', sourceUrl: `${MINHAJI}/4262` },
        { title: 'الأحافير', sourceUrl: `${MINHAJI}/4269` },
      ],
    },
    {
      number: 10,
      title: 'البيئة',
      lessons: [
        { title: 'المناطق البيئية', sourceUrl: `${MINHAJI}/23665` },
        { title: 'انتقال الطاقة ودورات المواد', sourceUrl: `${MINHAJI}/23926` },
      ],
    },
  ],
};

/**
 * علوم الصف الثامن — الوحدات والدروس كما وردت في صفحة المادة بالمصدر.
 * تقسيم الفصل الدراسي غير مثبَت، فلا يُنسب أي درس إلى فصل معيّن.
 */
const G8_SCIENCE: ImportedBookOutline = {
  key: 'g8-science',
  gradeNumber: 8,
  subjectTitle: 'العلوم',
  semester: null,
  semesterVerified: false,
  bookTitle: 'كتاب الطالب — العلوم',
  sourceName: 'شبكة منهاجي الأردنية',
  sourceUrl: `${MINHAJI}/1074`,
  verifiedBy:
    'أسماء الوحدات والدروس وترتيبها مأخوذة من صفحة مادة العلوم للصف الثامن في المصدر؛ صفحة المادة لا تنص على تقسيم الفصل الدراسي.',
  units: [
    {
      number: 1,
      title: 'الوراثة والتكاثر',
      lessons: [
        { title: 'المادة الوراثية', sourceUrl: `${MINHAJI}/7740` },
        { title: 'التكاثر', sourceUrl: `${MINHAJI}/24692` },
        { title: 'الوراثة', sourceUrl: `${MINHAJI}/7732` },
      ],
    },
    {
      number: 2,
      title: 'الذرة والجدول الدوري',
      lessons: [
        { title: 'تركيب الذرة والتوزيع الإلكتروني', sourceUrl: `${MINHAJI}/7686` },
        { title: 'الجدول الدوري وخصائص العناصر', sourceUrl: `${MINHAJI}/7700` },
      ],
    },
    {
      number: 3,
      title: 'ميكانيكا الموائع',
      lessons: [
        { title: 'الضغط', sourceUrl: `${MINHAJI}/7666` },
        { title: 'الكثافة والطفو', sourceUrl: `${MINHAJI}/7673` },
      ],
    },
    {
      number: 4,
      title: 'علوم الأرض والبيئة',
      lessons: [
        { title: 'الصفائح التكتونية وحركتها', sourceUrl: `${MINHAJI}/7767` },
        { title: 'الموارد الطبيعية', sourceUrl: `${MINHAJI}/24781` },
        { title: 'استدامة الموارد الطبيعية', sourceUrl: `${MINHAJI}/7778` },
      ],
    },
    {
      number: 5,
      title: 'جسم الإنسان وصحته',
      lessons: [
        { title: 'الضبط والتنظيم', sourceUrl: `${MINHAJI}/7639` },
        { title: 'المناعة', sourceUrl: `${MINHAJI}/25388` },
        { title: 'التكاثر والنمو', sourceUrl: `${MINHAJI}/7651` },
      ],
    },
    {
      number: 6,
      title: 'الحرارة',
      lessons: [
        { title: 'درجة الحرارة وتدريجات قياسها', sourceUrl: `${MINHAJI}/7749` },
        { title: 'الحرارة والمادة', sourceUrl: `${MINHAJI}/7759` },
      ],
    },
    {
      number: 7,
      title: 'الروابط والتفاعلات الكيميائية',
      lessons: [
        { title: 'الروابط الكيميائية', sourceUrl: `${MINHAJI}/7710` },
        { title: 'التفاعلات الكيميائية', sourceUrl: `${MINHAJI}/7719` },
      ],
    },
    {
      number: 8,
      title: 'المغناطيسية',
      lessons: [
        { title: 'المجال المغناطيسي', sourceUrl: `${MINHAJI}/25390` },
        { title: 'الكهرمغناطيسية', sourceUrl: `${MINHAJI}/25391` },
      ],
    },
    {
      number: 9,
      title: 'علوم الطقس والفضاء',
      lessons: [
        { title: 'الكتل الهوائية وتأثيرها في الطقس', sourceUrl: `${MINHAJI}/25393` },
        { title: 'استكشاف الفضاء', sourceUrl: `${MINHAJI}/25394` },
      ],
    },
  ],
};

export const IMPORTED_OUTLINES: ImportedBookOutline[] = [
  G1_SCIENCE,
  G2_SCIENCE,
  G3_SCIENCE,
  G4_SCIENCE,
  G5_SCIENCE,
  G6_SCIENCE,
  G7_SCIENCE,
  G8_SCIENCE,
  G2_MATH,
  G3_MATH,
  G4_MATH,
  G5_MATH_S1,
  G5_MATH_S2,
  G6_MATH,
  G7_MATH,
  G8_MATH,
  G9_MATH,
  G11_MATH,
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

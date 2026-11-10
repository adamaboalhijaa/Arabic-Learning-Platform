/**
 * فحص سلوكي لمحرّك الاستيراد المجمّع ونموذج المنهاج.
 * يشغّل نفس دوال المحرّك التي تستخدمها لوحة المشرف، ويتحقق من:
 * الهيكل (12 صفًا وفصلان لكل مادة)، والحفاظ على محتوى الرياضيات الموثّق،
 * ومنع التكرار عند إعادة الاستيراد، ورفض الصفوف الناقصة، وتحديث السؤال الموجود.
 *
 * التشغيل: npx tsx scripts/curriculum-check.ts
 */
import { parseCsv, toRecords } from '../src/curriculum/csv';
import { runImport } from '../src/curriculum/import';
import { createInitialState } from '../src/curriculum/store';
import { subjectStats } from '../src/curriculum/stats';

let failures = 0;

function check(condition: boolean, label: string, extra?: unknown): void {
  if (condition) {
    console.log(`ok   ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL ${label}`, extra ?? '');
  }
}

const state = createInitialState();

check(state.grades.length === 12, 'تم إنشاء 12 صفًا', state.grades.length);
check(
  state.grades.every((grade) => grade.subjects.length > 0),
  'لكل صف مواد',
  state.grades.map((grade) => `${grade.gradeNumber}:${grade.subjects.length}`).join(' '),
);
check(
  state.grades.every((grade) =>
    grade.subjects.every(
      (subject) => subject.semesters.length === 2 && subject.semesters[0].number === 1 && subject.semesters[1].number === 2,
    ),
  ),
  'لكل مادة فصلان دراسيان',
);

const grade10 = state.grades.find((grade) => grade.gradeNumber === 10);
const math = grade10?.subjects.find((subject) => subject.title === 'الرياضيات');
check(Boolean(math), 'مادة الرياضيات موجودة في الصف العاشر');

const mathStats = math ? subjectStats(math) : null;
check(
  mathStats?.units === 8 && mathStats?.lessons === 32 && mathStats?.questions === 160,
  'محتوى الرياضيات الموثّق محفوظ (8 وحدات / 32 درسًا / 160 سؤالًا)',
  mathStats,
);

const HEADERS = [
  'الصف',
  'المادة',
  'الفرع',
  'الفصل',
  'الوحدة',
  'الدرس',
  'هدف الدرس',
  'شرح الدرس',
  'الصفحة',
  'نوع السؤال',
  'السؤال',
  'الخيار 1',
  'الخيار 2',
  'الخيار 3',
  'الخيار 4',
  'الإجابة الصحيحة',
  'الشرح',
  'الصعوبة',
  'المرجع',
] as const;

type RowValues = Partial<Record<(typeof HEADERS)[number], string>>;

/** يبني سطر CSV بالاعتماد على أسماء الأعمدة، فلا تنزاح الحقول. */
function makeRow(values: RowValues): string {
  return HEADERS.map((header) => values[header] ?? '').join(',');
}

const baseLesson: RowValues = {
  'الصف': '10',
  'المادة': 'الرياضيات',
  'الفصل': '1',
  'الوحدة': 'وحدة فحص المحرّك',
  'الدرس': 'درس فحص المحرّك',
  'هدف الدرس': 'هدف الفحص',
  'شرح الدرس': 'شرح الفحص',
  'الصفحة': '7',
  'المرجع': 'كتاب الطالب — صفحة 7',
};

const mcqRow: RowValues = {
  ...baseLesson,
  'نوع السؤال': 'اختيار من متعدد',
  'السؤال': 'ما ناتج ٢+٢؟',
  'الخيار 1': '3',
  'الخيار 2': '4',
  'الخيار 3': '5',
  'الخيار 4': '6',
  'الإجابة الصحيحة': '4',
  'الشرح': 'لأن ٢+٢=٤',
  'الصعوبة': 'سهل',
};

const tfRow: RowValues = {
  ...baseLesson,
  'نوع السؤال': 'صح وخطأ',
  'السؤال': '٢+٢=٤',
  'الإجابة الصحيحة': 'صح',
  'الشرح': '٢+٢ تساوي ٤ بالفعل',
  'الصعوبة': 'سهل',
};

const csvRows = [HEADERS.join(','), makeRow(mcqRow), makeRow(tfRow)].join('\n');

const rows = toRecords(parseCsv(csvRows));
check(rows.length === 2, 'قارئ CSV أنتج صفين', rows.length);

const first = runImport(state, rows, 'skip');
check(first.plan.canApply, 'الاستيراد الأول صالح للتطبيق', first.plan.issues);
check(first.plan.creates.questions === 2, 'الاستيراد الأول ينشئ سؤالين', first.plan.creates);
check(first.plan.creates.lessons === 1 && first.plan.creates.units === 1, 'ينشئ درسًا ووحدة مرة واحدة', first.plan.creates);

const second = runImport(first.state, rows, 'skip');
check(second.plan.creates.questions === 0, 'إعادة الاستيراد لا تنشئ أسئلة مكررة', second.plan.creates);
check(second.plan.skipped.length === 2, 'إعادة الاستيراد تتجاهل الصفين المكررين', second.plan.skipped.length);

const invalidRows = toRecords(
  parseCsv(
    [
      HEADERS.join(','),
      makeRow({
        ...baseLesson,
        'الدرس': 'درس بلا شرح',
        'نوع السؤال': 'اختيار من متعدد',
        'السؤال': 'سؤال بلا شرح',
        'الخيار 1': 'أ',
        'الخيار 2': 'ب',
        'الإجابة الصحيحة': '1',
        'الصعوبة': 'سهل',
      }),
    ].join('\n'),
  ),
);
const invalid = runImport(first.state, invalidRows, 'skip');
check(!invalid.plan.canApply && invalid.plan.issues.length > 0, 'الصف الناقص يمنع التطبيق ويُبلّغ بخطأ', invalid.plan.issues);

const updateRows = toRecords(
  parseCsv([HEADERS.join(','), makeRow({ ...mcqRow, 'الشرح': 'شرح محدّث للفحص' })].join('\n')),
);
check(updateRows.length === 1, 'صف التحديث يحتوي سؤالًا واحدًا', updateRows.length);
const updated = runImport(first.state, updateRows, 'update');
check(updated.plan.updates.questions === 1, 'وضع التحديث يعدّل السؤال الموجود', updated.plan.updates);

if (failures === 0) {
  console.log('ALL CURRICULUM CHECKS PASSED');
  process.exit(0);
}
console.error(`${failures} CURRICULUM CHECK(S) FAILED`);
process.exit(1);

/**
 * فحص محتوى الرياضيات للصف العاشر.
 * يتأكد أن كل درس مرتبط بأسئلته الخاصة، وأن بنك الأسئلة يغطي درجات الصعوبة الثلاث
 * والنوعين (اختيار من متعدد، صح وخطأ)، وأن لكل سؤال شرحًا ومرجع صفحة وإجابة صحيحة صالحة.
 *
 * التشغيل: npx tsx scripts/math10-check.ts
 */
import {
  MATH10_LESSONS,
  MATH10_SEMESTERS,
  MATH10_UNITS,
  lessonLevelCounts,
  lessonQuestionCount,
  math10LevelTotals,
  questionLevel,
  validateMathContent,
} from '../src/data/math10/index';

const problems: string[] = [];
const check = (condition: boolean, message: string) => {
  if (!condition) problems.push(message);
};

// 1) الهيكل: 8 وحدات موزّعة على فصلين دراسيين، و4 دروس في كل وحدة على الأقل.
check(MATH10_UNITS.length === 8, `عدد الوحدات ${MATH10_UNITS.length} بدل 8`);
check(MATH10_SEMESTERS.length === 2, `عدد الفصول ${MATH10_SEMESTERS.length} بدل 2`);
check(
  MATH10_SEMESTERS.every((semester) => semester.units.length === 4),
  'توزيع الوحدات على الفصلين غير متساوٍ (4 لكل فصل)',
);
check(MATH10_LESSONS.length === 32, `عدد الدروس ${MATH10_LESSONS.length} بدل 32`);

// 2) كل درس: 5 أسئلة على الأقل، وكل الدرجات الثلاث، والنوعان.
for (const lesson of MATH10_LESSONS) {
  check(lesson.questions.length >= 5, `${lesson.id}: عدد الأسئلة ${lesson.questions.length}`);
  const counts = lessonLevelCounts(lesson);
  check(counts.easy > 0, `${lesson.id}: بلا سؤال سهل`);
  check(counts.medium > 0, `${lesson.id}: بلا سؤال متوسط`);
  check(counts.hard > 0, `${lesson.id}: بلا سؤال متقدم`);
  check(
    lesson.questions.some((question) => question.kind === 'mcq'),
    `${lesson.id}: بلا اختيار من متعدد`,
  );
  check(
    lesson.questions.some((question) => question.kind === 'truefalse'),
    `${lesson.id}: بلا صح وخطأ`,
  );
}

// 3) سلامة كل سؤال (خيارات، إجابة صحيحة، شرح، مرجع صفحة).
const issues = validateMathContent();
check(issues.length === 0, `أخطاء محتوى: ${issues.map((issue) => `${issue.questionId} (${issue.message})`).join(' · ')}`);

// 4) الترتيب داخل كل درس: سهل ← متوسط ← متقدم.
const order = { easy: 0, medium: 1, hard: 2 } as const;
for (const lesson of MATH10_LESSONS) {
  const levels = lesson.questions.map((question) => order[questionLevel(question)]);
  check(
    levels.every((value, index) => index === 0 || levels[index - 1] <= value),
    `${lesson.id}: الأسئلة غير مرتبة حسب الصعوبة`,
  );
}

// 5) لا تكرار في نصوص الأسئلة.
const prompts = new Map<string, string>();
for (const lesson of MATH10_LESSONS) {
  for (const question of lesson.questions) {
    const previous = prompts.get(question.prompt);
    check(!previous, `نص سؤال مكرر: ${question.id} يكرر ${previous}`);
    prompts.set(question.prompt, question.id);
  }
}

const totals = math10LevelTotals();
console.log(
  `الوحدات: ${MATH10_UNITS.length} · الدروس: ${MATH10_LESSONS.length} · الأسئلة: ${lessonQuestionCount()}`,
);
console.log(`سهل: ${totals.easy} · متوسط: ${totals.medium} · متقدم: ${totals.hard}`);

if (problems.length) {
  console.error('\nفشل فحص محتوى الرياضيات:');
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}

console.log('\nALL MATH10 CONTENT CHECKS PASSED');

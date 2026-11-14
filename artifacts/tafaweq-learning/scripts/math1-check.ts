// فحص محتوى رياضيات الصف الأول: الهيكل، الدروس، الأسئلة، الصعوبة، والمراجع.
// التشغيل: npm run check:math1
import { MATH1 } from '../src/data/math1';

const problems: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) problems.push(message);
}

const EXPECTED_UNITS = 8;
const EXPECTED_LESSONS = 24;
const EXPECTED_QUESTIONS = 120;
const QUESTIONS_PER_LESSON = 5;

check(MATH1.grade === 1, 'رقم الصف يجب أن يكون 1');
check(MATH1.units.length === EXPECTED_UNITS, `عدد الوحدات يجب أن يكون ${EXPECTED_UNITS}، وجد ${MATH1.units.length}`);
check(MATH1.lessons.length === EXPECTED_LESSONS, `عدد الدروس يجب أن يكون ${EXPECTED_LESSONS}، وجد ${MATH1.lessons.length}`);
check(
  MATH1.questionTotal === EXPECTED_QUESTIONS,
  `عدد الأسئلة يجب أن يكون ${EXPECTED_QUESTIONS}، وجد ${MATH1.questionTotal}`,
);
check(MATH1.semesters.length === 2, `يجب أن يكون هناك فصلان دراسيان، وجد ${MATH1.semesters.length}`);
check(MATH1.semesters[0]?.units.length === 4, 'الفصل الأول يجب أن يحتوي 4 وحدات');
check(MATH1.semesters[1]?.units.length === 4, 'الفصل الثاني يجب أن يحتوي 4 وحدات');

for (const lesson of MATH1.lessons) {
  check(
    lesson.questions.length === QUESTIONS_PER_LESSON,
    `الدرس ${lesson.id} يجب أن يحتوي ${QUESTIONS_PER_LESSON} أسئلة، وجد ${lesson.questions.length}`,
  );
  const levels = MATH1.lessonLevelCounts(lesson);
  check(levels.easy > 0, `الدرس ${lesson.id} بلا سؤال سهل`);
  check(levels.medium > 0, `الدرس ${lesson.id} بلا سؤال متوسط`);
  check(levels.hard > 0, `الدرس ${lesson.id} بلا سؤال متقدم`);
  check(
    lesson.questions.some((question) => question.kind === 'mcq'),
    `الدرس ${lesson.id} بلا سؤال اختيار من متعدد`,
  );
  check(
    lesson.questions.some((question) => question.kind === 'truefalse'),
    `الدرس ${lesson.id} بلا سؤال صح وخطأ`,
  );
  check(lesson.explanation.trim().length > 40, `شرح الدرس ${lesson.id} قصير جدًا`);
  check(lesson.examples.length > 0, `الدرس ${lesson.id} بلا أمثلة محلولة`);
}

// كل سؤال مرتبط بمرجعه، وشرحه موجود، والإجابة داخل الخيارات.
for (const lesson of MATH1.lessons) {
  for (const question of lesson.questions) {
    check(question.page.trim().length > 0, `السؤال ${question.id} بلا مرجع`);
    check(question.explanation.trim().length > 0, `السؤال ${question.id} بلا شرح`);
    check(
      question.correctOption >= 0 && question.correctOption < question.options.length,
      `السؤال ${question.id}: الإجابة الصحيحة خارج الخيارات`,
    );
    check(
      new Set(question.options).size === question.options.length,
      `السؤال ${question.id}: خيارات مكررة`,
    );
  }
}

// معرّفات فريدة على مستوى الصف كامل.
const lessonIds = MATH1.lessons.map((lesson) => lesson.id);
check(new Set(lessonIds).size === lessonIds.length, 'معرّفات دروس مكررة');
const questionIds = MATH1.lessons.flatMap((lesson) => lesson.questions.map((question) => question.id));
check(new Set(questionIds).size === questionIds.length, 'معرّفات أسئلة مكررة');

// معرّفات الصف الأول لا تتقاطع مع معرّفات الصف العاشر (m10-*) حتى لا يتداخل التقدم.
check(questionIds.every((id) => id.startsWith('m1-')), 'كل معرّفات أسئلة الصف الأول يجب أن تبدأ بـ m1-');
check(lessonIds.every((id) => id.startsWith('m1-')), 'كل معرّفات دروس الصف الأول يجب أن تبدأ بـ m1-');

// المدقق الداخلي للمحتوى.
for (const issue of MATH1.validate()) {
  problems.push(`مدقق المحتوى: ${issue.questionId} — ${issue.message}`);
}

const totals = MATH1.levelTotals();

if (problems.length > 0) {
  console.error(`FAILED — ${problems.length} مشكلة في محتوى رياضيات الصف الأول:`);
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}

console.log('ALL MATH1 CONTENT CHECKS PASSED');
console.log(`الصف: ${MATH1.meta.grade} · الوحدات: ${MATH1.units.length} · الدروس: ${MATH1.lessons.length} · الأسئلة: ${MATH1.questionTotal}`);
console.log(`الصعوبة: ${totals.easy} سهل · ${totals.medium} متوسط · ${totals.hard} متقدم`);
for (const semester of MATH1.semesters) {
  console.log(`${semester.title}: ${semester.units.length} وحدات — ${semester.units.map((unit) => unit.title).join(' · ')}`);
}

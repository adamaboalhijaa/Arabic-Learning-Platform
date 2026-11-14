/**
 * فحص سجل الكتب الرسمية: اكتمال الفصلين لكل مادة، عدم التكرار، وربط الدروس بوحداتها.
 * التشغيل: npx tsx scripts/books-check.ts
 */
import {
  ALL_LESSONS,
  ALL_QUESTIONS,
  ALL_SUBJECTS,
  ALL_UNITS,
} from '../src/lib/curriculum-books';
import {
  OFFICIAL_BOOKS,
  curriculumCompletion,
  duplicateIssues,
  gradeSourcePage,
} from '../src/lib/official-books';

const problems: string[] = [];
const check = (condition: boolean, message: string) => {
  if (!condition) problems.push(message);
};

// 1) كتابان لكل مادة (فصل أول + فصل ثانٍ) بلا تكرار.
check(
  OFFICIAL_BOOKS.length === ALL_SUBJECTS.length * 2,
  `عدد الكتب ${OFFICIAL_BOOKS.length} لا يساوي ضعف عدد المواد ${ALL_SUBJECTS.length}`,
);
for (const subject of ALL_SUBJECTS) {
  const books = OFFICIAL_BOOKS.filter((book) => book.subjectId === subject.id);
  check(books.length === 2, `المادة ${subject.id} (${subject.title}) لها ${books.length} كتابًا بدل 2`);
  check(
    books.some((book) => book.semester === 1) && books.some((book) => book.semester === 2),
    `المادة ${subject.id} لا تغطي الفصلين`,
  );
  check(
    books.every((book) => book.sourcePage.startsWith('https://')),
    `المادة ${subject.id} بلا رابط مصدر رسمي`,
  );
}

// 2) لا تكرار في الكتب أو المواد أو الوحدات أو الدروس.
const duplicates = duplicateIssues();
check(duplicates.length === 0, `تكرارات: ${duplicates.map((d) => d.detail).join(' | ')}`);

// 3) كل درس مربوط بوحدة موجودة، وكل سؤال مربوط بدرس موجود، وحالة الكتاب تطابق محتواه.
const unitIds = new Set(ALL_UNITS.map((unit) => unit.id));
const lessonIds = new Set(ALL_LESSONS.map((lesson) => lesson.id));
for (const lesson of ALL_LESSONS) {
  check(unitIds.has(lesson.unitId), `الدرس ${lesson.id} غير مربوط بوحدة موجودة`);
}
for (const question of ALL_QUESTIONS) {
  check(lessonIds.has(question.lessonId), `السؤال ${question.id} غير مربوط بدرس موجود`);
}
for (const book of OFFICIAL_BOOKS) {
  if (book.status === 'linked') {
    check(book.units > 0, `الكتاب ${book.key} مربوط بلا وحدات`);
  } else {
    check(
      book.units === 0 && book.lessons === 0,
      `الكتاب ${book.key} بانتظار الاستيراد لكن فيه محتوى غير منسوب`,
    );
  }
}

// 4) كل صف له صفحة مصدر رسمية.
const completion = curriculumCompletion();
for (const grade of completion.grades) {
  check(grade.subjects > 0, `الصف ${grade.gradeNumber} بلا مواد`);
  check(
    grade.sourcePage === gradeSourcePage(grade.gradeNumber),
    `الصف ${grade.gradeNumber} بلا صفحة مصدر متسقة`,
  );
}

console.log(
  `الكتب: ${completion.totals.books} (مربوطة ${completion.totals.booksLinked} · بانتظار الاستيراد ${completion.totals.booksPending})`,
);
console.log(
  `المواد: ${completion.totals.subjects} · الوحدات: ${completion.totals.units} · الدروس: ${completion.totals.lessons} · الأسئلة: ${completion.totals.questions}`,
);
for (const grade of completion.grades) {
  console.log(
    `الصف ${grade.gradeNumber}: ${grade.subjects} مواد · ${grade.booksLinked}/${grade.books} كتاب مربوط · ${grade.units} وحدة · ${grade.lessons} درسًا`,
  );
}

if (problems.length) {
  console.error('BOOK REGISTRY CHECKS FAILED');
  for (const problem of problems) console.error(' - ' + problem);
  process.exit(1);
}
console.log('ALL OFFICIAL BOOK REGISTRY CHECKS PASSED');

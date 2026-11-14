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
import { IMPORTED_OUTLINES, outlineFor, outlineStats } from '../src/data/imported-outlines';

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
  } else if (book.status === 'outline-imported') {
    check(book.units > 0 && book.lessons > 0, `الكتاب ${book.key} مستورد بلا وحدات أو دروس`);
    check(
      typeof book.outlineSourceUrl === 'string' && book.outlineSourceUrl.startsWith('https://'),
      `الكتاب ${book.key} بلا رابط مصدر للوحدات المستوردة`,
    );
    check(
      typeof book.outlineVerifiedBy === 'string' && book.outlineVerifiedBy.length > 0,
      `الكتاب ${book.key} بلا دليل على ترتيب وحداته وتقسيم فصله`,
    );
  } else {
    check(
      book.units === 0 && book.lessons === 0,
      `الكتاب ${book.key} بانتظار الاستيراد لكن فيه محتوى غير منسوب`,
    );
  }
}

// 3ب) الكتب المستوردة: مطابقة مادة موجودة، وسلامة التعداد والعناوين وروابط المصدر.
for (const outline of IMPORTED_OUTLINES) {
  const stats = outlineStats(outline);
  const matches = OFFICIAL_BOOKS.filter(
    (item) =>
      item.gradeNumber === outline.gradeNumber &&
      item.subjectTitle.trim() === outline.subjectTitle.trim(),
  );
  check(matches.length > 0, `لا كتاب في السجل يطابق المستورد ${outline.key}`);
  if (outline.semesterVerified) {
    const book = matches.find((item) => item.semester === outline.semester);
    check(!!book, `لا كتاب في السجل يطابق المستورد ${outline.key}`);
    if (book) {
      check(book.units === stats.units, `الكتاب ${book.key}: عدد الوحدات لا يطابق المستورد`);
      check(book.lessons === stats.lessons, `الكتاب ${book.key}: عدد الدروس لا يطابق المستورد`);
    }
    const semester = outline.semester === 2 ? 2 : 1;
    check(
      outlineFor(outline.gradeNumber, outline.subjectTitle, semester) === outline,
      `البحث عن المستورد ${outline.key} لا يعيده`,
    );
  } else {
    // كتاب لم يثبت المصدر تقسيمه: لا يُنسب إلى فصل، ولا تُنسخ أعداده على كتابي الفصلين.
    check(
      outline.semester === null,
      `المستورد ${outline.key} غير موثق لكنه منسوب إلى فصل دراسي`,
    );
    check(
      matches.length === 2 && matches.every((book) => book.status === 'outline-unverified'),
      `المستورد ${outline.key} غير موثق لكن حالة كتابيه لا تعكس ذلك`,
    );
    check(
      matches.every((book) => book.units === 0 && book.lessons === 0),
      `المستورد ${outline.key} غير موثق لكن أعداده نُسبت إلى كتاب فصل`,
    );
    check(
      outlineFor(outline.gradeNumber, outline.subjectTitle, 1) === outline &&
        outlineFor(outline.gradeNumber, outline.subjectTitle, 2) === outline,
      `البحث عن المستورد غير الموثق ${outline.key} لا يعيده في الفصلين`,
    );
  }
  for (const unit of outline.units) {
    check(unit.title.trim().length > 0, `وحدة بلا عنوان في ${outline.key}`);
    check(unit.lessons.length > 0, `الوحدة «${unit.title}» في ${outline.key} بلا دروس`);
    for (const lesson of unit.lessons) {
      check(lesson.title.trim().length > 0, `درس بلا عنوان في ${outline.key}`);
      check(
        !lesson.sourceUrl || lesson.sourceUrl.startsWith('https://'),
        `درس «${lesson.title}» في ${outline.key} برابط مصدر غير صالح`,
      );
    }
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
  `الكتب المستوردة: ${IMPORTED_OUTLINES.length} · الوحدات: ${IMPORTED_OUTLINES.reduce((sum, outline) => sum + outlineStats(outline).units, 0)} · الدروس: ${IMPORTED_OUTLINES.reduce((sum, outline) => sum + outlineStats(outline).lessons, 0)}`,
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

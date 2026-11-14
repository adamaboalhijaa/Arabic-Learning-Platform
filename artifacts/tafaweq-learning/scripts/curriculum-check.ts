/**
 * فحص هيكل المنهاج الكامل: الصفوف 1–12، مواد كل صف، الكتب المربوطة،
 * الفصلان الدراسيان، الوحدات والدروس والأسئلة، والمعرّفات الفريدة.
 * يفشل السكربت (exit 1) عند أي خلل حقيقي في الربط أو المحتوى.
 */
import {
  ALL_LESSONS,
  ALL_QUESTIONS,
  ALL_SUBJECTS,
  ALL_UNITS,
  CURRICULUM_GRADES,
  availableBooks,
  gradeById,
  gradeHasContent,
  lessonById,
  lessonsOfUnit,
  mathSubjectOfGrade,
  questionIdFor,
  subjectById,
  unitById,
  unitsOfSubject,
} from '../src/lib/curriculum-books';

const errors: string[] = [];
const check = (ok: boolean, message: string) => {
  if (!ok) errors.push(message);
};

// 1) الصفوف: 12 صفًا بالترتيب من الأول إلى الثاني عشر، ولكل صف مواد.
check(CURRICULUM_GRADES.length === 12, 'عدد الصفوف يجب أن يكون 12');
CURRICULUM_GRADES.forEach((grade, index) => {
  check(grade.gradeNumber === index + 1, `ترتيب الصفوف غير صحيح عند الصف ${grade.gradeNumber}`);
  check(gradeById(grade.gradeNumber) === grade, `تعذّر العثور على الصف ${grade.gradeNumber}`);
  check(grade.subjects.length >= 4, `الصف ${grade.gradeNumber} بلا مواد كافية`);
  check(grade.title.trim().length > 0, `الصف ${grade.gradeNumber} بلا عنوان`);
});

// 2) المواد: معرّفات فريدة وكل مادة تابعة لصفها.
const subjectIds = new Set<number>();
ALL_SUBJECTS.forEach((subject) => {
  check(!subjectIds.has(subject.id), `معرّف مادة مكرر: ${subject.id}`);
  subjectIds.add(subject.id);
  check(!!gradeById(subject.gradeNumber), `مادة بلا صف: ${subject.title}`);
  check(subjectById(subject.id) === subject, `تعذّر العثور على المادة ${subject.id}`);
  check(subject.description.trim().length > 0, `مادة بلا وصف: ${subject.title}`);
});

// 3) الوحدات: فصل صحيح، دروس موجودة، ترقيم متصل داخل كل فصل.
const unitIds = new Set<number>();
ALL_UNITS.forEach((unit) => {
  check(!unitIds.has(unit.id), `معرّف وحدة مكرر: ${unit.id}`);
  unitIds.add(unit.id);
  check(unit.semester === 1 || unit.semester === 2, `فصل دراسي غير صحيح للوحدة: ${unit.unit.title}`);
  check(unit.lessonIds.length > 0, `وحدة بلا دروس: ${unit.unit.title}`);
  check(unitById(unit.id) === unit, `تعذّر العثور على الوحدة ${unit.id}`);
  check(!!subjectById(unit.subjectId), `وحدة بلا مادة: ${unit.unit.title}`);
});
ALL_SUBJECTS.forEach((subject) => {
  ([1, 2] as const).forEach((semester) => {
    const list = unitsOfSubject(subject.id)
      .filter((unit) => unit.semester === semester)
      .sort((a, b) => a.position - b.position);
    list.forEach((unit, index) => {
      check(unit.position === index, `ترقيم وحدات غير متصل في ${subject.title} — الفصل ${semester}`);
    });
  });
});

// 4) الدروس والأسئلة: شرح وهدف لكل درس، وخيارات وإجابة صحيحة وشرح لكل سؤال.
const lessonIds = new Set<number>();
const questionIds = new Set<number>();
ALL_LESSONS.forEach((record) => {
  check(!lessonIds.has(record.id), `معرّف درس مكرر: ${record.id}`);
  lessonIds.add(record.id);
  check(lessonById(record.id) === record, `تعذّر العثور على الدرس ${record.id}`);
  check(lessonsOfUnit(record.unitId).includes(record), `درس غير مرتبط بوحدته: ${record.lesson.title}`);
  check(record.lesson.questions.length > 0, `درس بلا أسئلة: ${record.lesson.title}`);
  check(!!record.lesson.explanation?.trim(), `درس بلا شرح: ${record.lesson.title}`);
  check(!!record.lesson.objective?.trim(), `درس بلا هدف: ${record.lesson.title}`);
  record.lesson.questions.forEach((question, index) => {
    const id = questionIdFor(record.id, index);
    check(!questionIds.has(id), `معرّف سؤال مكرر: ${id}`);
    questionIds.add(id);
    check(question.options.length >= 2, `سؤال بخيارات ناقصة: ${question.prompt}`);
    check(
      question.correctOption >= 0 && question.correctOption < question.options.length,
      `إجابة صحيحة خارج الخيارات: ${question.prompt}`,
    );
    check(!!question.explanation?.trim(), `سؤال بلا شرح: ${question.prompt}`);
    check(question.options.every((option) => option.trim().length > 0), `خيار فارغ في: ${question.prompt}`);
  });
});
check(questionIds.size === ALL_QUESTIONS.length, 'عدد الأسئلة في السجل لا يطابق المعرّفات المولّدة');

// 5) ربط الكتب الموجودة: رياضيات الصف الأول والصف العاشر.
const grade1 = mathSubjectOfGrade(1);
check(!!grade1, 'كتاب رياضيات الصف الأول غير مربوط بالصف الأول ومادة الرياضيات');
if (grade1) {
  const units = unitsOfSubject(grade1.id);
  check(units.length === 8, `رياضيات الصف الأول: ${units.length} وحدة بدل 8`);
  check(units.filter((unit) => unit.semester === 1).length === 4, 'الفصل الأول للصف الأول يجب أن يحتوي 4 وحدات');
  check(units.filter((unit) => unit.semester === 2).length === 4, 'الفصل الثاني للصف الأول يجب أن يحتوي 4 وحدات');
  check(grade1.book?.lessons.length === 24, 'عدد دروس الصف الأول يجب أن يكون 24');
  check(grade1.book?.questionTotal === 120, 'عدد أسئلة الصف الأول يجب أن يكون 120');
}

const grade10 = mathSubjectOfGrade(10);
check(!!grade10, 'كتاب رياضيات الصف العاشر غير مربوط');
if (grade10) {
  check(unitsOfSubject(grade10.id).length === 8, 'عدد وحدات الصف العاشر تغيّر');
  check(grade10.book?.lessons.length === 32, 'عدد دروس الصف العاشر تغيّر');
  check(grade10.book?.questionTotal === 224, 'عدد أسئلة الصف العاشر تغيّر');
}

// 6) لا محتوى عشوائي: أي مادة بلا كتاب يجب أن تكون بلا وحدات.
ALL_SUBJECTS.forEach((subject) => {
  if (!subject.book) {
    check(unitsOfSubject(subject.id).length === 0, `مادة بلا كتاب تحتوي وحدات: ${subject.title}`);
  }
});

const books = availableBooks();
const gradesWithContent = CURRICULUM_GRADES.filter((grade) => gradeHasContent(grade.gradeNumber));
check(books.length >= 2, 'يجب أن يكون هناك كتابان مربوطان على الأقل');
check(gradesWithContent.length >= 2, 'يجب أن يحتوي صفّان على محتوى على الأقل');

if (errors.length) {
  console.error('فشل فحص المنهاج:');
  errors.forEach((message) => console.error(' -', message));
  process.exit(1);
}

const semesterCount = (subjectId: number, semester: 1 | 2) =>
  unitsOfSubject(subjectId).filter((unit) => unit.semester === semester).length;

console.log(`الصفوف: ${CURRICULUM_GRADES.length} · المواد: ${ALL_SUBJECTS.length} · الكتب المربوطة: ${books.length}`);
console.log(`الوحدات: ${ALL_UNITS.length} · الدروس: ${ALL_LESSONS.length} · الأسئلة: ${ALL_QUESTIONS.length}`);
if (grade1) {
  console.log(
    `رياضيات الصف الأول: ${unitsOfSubject(grade1.id).length} وحدات · ${grade1.book?.lessons.length} درسًا · ${grade1.book?.questionTotal} سؤالًا` +
      ` (الفصل الأول ${semesterCount(grade1.id, 1)} · الثاني ${semesterCount(grade1.id, 2)})`,
  );
}
if (grade10) {
  console.log(
    `رياضيات الصف العاشر: ${unitsOfSubject(grade10.id).length} وحدات · ${grade10.book?.lessons.length} درسًا · ${grade10.book?.questionTotal} سؤالًا` +
      ` (الفصل الأول ${semesterCount(grade10.id, 1)} · الثاني ${semesterCount(grade10.id, 2)})`,
  );
}
console.log('ALL CURRICULUM STRUCTURE CHECKS PASSED');

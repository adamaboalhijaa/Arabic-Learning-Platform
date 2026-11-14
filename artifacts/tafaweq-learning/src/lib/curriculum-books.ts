/**
 * سجل المنهاج الموحّد: الصفوف من الأول إلى الثاني عشر، ومواد كل صف، والكتب المتوفرة فعلًا.
 *
 * الطبقة نقية (بلا window أو تخزين) حتى يستخدمها كل من الواجهة وسكربت الفحص:
 * - الهيكل (صف/مادة/فصل) يأتي من catalog.ts ولا يُخترع هنا.
 * - الوحدات والدروس والأسئلة تأتي من كتب الرياضيات المضافة في data/math-grades.ts فقط،
 *   فأي مادة بلا كتاب تظهر بحالة «لم يُضف بعد» بدل محتوى عشوائي.
 * - كل عنصر له معرّف رقمي ثابت مشتق من ترتيبه، ويُستخدم في مسارات التنقل وحفظ التقدّم.
 */
import { buildCatalog } from '../curriculum/catalog';
import { MATH_GRADES } from '../data/math-grades';
import type { MathContent, MathLesson, MathQuestion, MathUnit } from '../data/math-content';

export const MATH_SUBJECT_TITLE = 'الرياضيات';

const SUBJECT_ID_BASE = 1000;
const SUBJECT_ID_STRIDE = 20;
const UNIT_ID_BASE = 20000;
const LESSON_ID_BASE = 30000;
const QUESTION_ID_BASE = 400000;
const QUESTION_STRIDE = 100;

export type SemesterNumber = 1 | 2;

export interface BookSubject {
  id: number;
  gradeNumber: number;
  title: string;
  stream: string;
  description: string;
  /** الكتاب المرتبط بهذه المادة، أو null إذا لم يُضف بعد. */
  book: MathContent | null;
}

export interface BookUnit {
  id: number;
  subjectId: number;
  gradeNumber: number;
  semester: SemesterNumber;
  /** ترتيب الوحدة داخل فصلها، يبدأ من 0. */
  position: number;
  unit: MathUnit;
  lessonIds: number[];
}

export interface BookLesson {
  id: number;
  unitId: number;
  subjectId: number;
  gradeNumber: number;
  semester: SemesterNumber;
  lesson: MathLesson;
  content: MathContent;
}

export interface BookQuestion {
  id: number;
  lessonId: number;
  index: number;
  question: MathQuestion;
}

/** الصفوف الاثنا عشر كاملة مع مواد كل صف (هيكل المنهاج). */
export const CURRICULUM_GRADES = buildCatalog();

const subjectRecords: BookSubject[] = [];
const unitRecords: BookUnit[] = [];
const lessonRecords: BookLesson[] = [];
const questionRecords: BookQuestion[] = [];

// 1) المواد: كل مادة في كل صف تأخذ معرّفًا ثابتًا، وتُربط بكتابها إن وُجد.
for (const grade of CURRICULUM_GRADES) {
  const booksForGrade = MATH_GRADES.filter((content) => content.grade === grade.gradeNumber);
  let bookCursor = 0;
  grade.subjects.forEach((subject, index) => {
    const book =
      subject.title === MATH_SUBJECT_TITLE && bookCursor < booksForGrade.length
        ? booksForGrade[bookCursor++]
        : null;
    subjectRecords.push({
      id: SUBJECT_ID_BASE + grade.gradeNumber * SUBJECT_ID_STRIDE + index,
      gradeNumber: grade.gradeNumber,
      title: subject.title,
      stream: subject.stream,
      description: book
        ? `${book.meta.book} · ${book.units.length} وحدات و${book.lessons.length} درسًا`
        : 'لم يُضف كتاب هذه المادة بعد؛ تُستورد الوحدات والدروس من الكتاب الرسمي المعتمد.',
      book,
    });
  });
}

// 2) الوحدات والدروس والأسئلة من الكتب المتوفرة، مرتّبة بالفصل الدراسي ثم بالوحدة.
for (const subject of subjectRecords) {
  const content = subject.book;
  if (!content) continue;
  for (const semester of content.semesters) {
    const semesterNumber: SemesterNumber = semester.number === 2 ? 2 : 1;
    semester.units.forEach((unit, position) => {
      const unitId = UNIT_ID_BASE + unitRecords.length;
      const unitRecord: BookUnit = {
        id: unitId,
        subjectId: subject.id,
        gradeNumber: subject.gradeNumber,
        semester: semesterNumber,
        position,
        unit,
        lessonIds: [],
      };
      unitRecords.push(unitRecord);
      unit.lessons.forEach((lesson) => {
        const lessonId = LESSON_ID_BASE + lessonRecords.length;
        lessonRecords.push({
          id: lessonId,
          unitId,
          subjectId: subject.id,
          gradeNumber: subject.gradeNumber,
          semester: semesterNumber,
          lesson,
          content,
        });
        unitRecord.lessonIds.push(lessonId);
        lesson.questions.forEach((question, index) => {
          questionRecords.push({
            id: QUESTION_ID_BASE + (lessonId - LESSON_ID_BASE) * QUESTION_STRIDE + index,
            lessonId,
            index,
            question,
          });
        });
      });
    });
  }
}

export const ALL_SUBJECTS: readonly BookSubject[] = subjectRecords;
export const ALL_UNITS: readonly BookUnit[] = unitRecords;
export const ALL_LESSONS: readonly BookLesson[] = lessonRecords;
export const ALL_QUESTIONS: readonly BookQuestion[] = questionRecords;

const gradeByNumber = new Map(CURRICULUM_GRADES.map((grade) => [grade.gradeNumber, grade]));
const subjectByIdMap = new Map(subjectRecords.map((subject) => [subject.id, subject]));
const unitByIdMap = new Map(unitRecords.map((unit) => [unit.id, unit]));
const lessonByIdMap = new Map(lessonRecords.map((lesson) => [lesson.id, lesson]));

export function gradeById(gradeNumber: number) {
  return gradeByNumber.get(gradeNumber);
}

export function subjectById(subjectId: number) {
  return subjectByIdMap.get(subjectId);
}

export function unitById(unitId: number) {
  return unitByIdMap.get(unitId);
}

export function lessonById(lessonId: number) {
  return lessonByIdMap.get(lessonId);
}

export function subjectsOfGrade(gradeNumber: number): BookSubject[] {
  return subjectRecords.filter((subject) => subject.gradeNumber === gradeNumber);
}

export function unitsOfSubject(subjectId: number): BookUnit[] {
  return unitRecords.filter((unit) => unit.subjectId === subjectId);
}

export function lessonsOfUnit(unitId: number): BookLesson[] {
  return lessonRecords.filter((lesson) => lesson.unitId === unitId);
}

export function questionIdFor(lessonId: number, index: number): number {
  return QUESTION_ID_BASE + (lessonId - LESSON_ID_BASE) * QUESTION_STRIDE + index;
}

/** هل يوجد كتاب فعلي (وحدات ودروس) لهذا الصف؟ */
export function gradeHasContent(gradeNumber: number): boolean {
  return subjectRecords.some((subject) => subject.gradeNumber === gradeNumber && subject.book);
}

/** مادة الرياضيات المربوطة بكتاب لصف معيّن. */
export function mathSubjectOfGrade(gradeNumber: number): BookSubject | undefined {
  return subjectRecords.find(
    (subject) =>
      subject.gradeNumber === gradeNumber &&
      subject.title === MATH_SUBJECT_TITLE &&
      subject.book !== null,
  );
}

/** الكتب المضافة فعلًا — تُستخدم لعرض ما هو متاح للدراسة الآن. */
export function availableBooks(): BookSubject[] {
  return subjectRecords.filter((subject) => subject.book !== null);
}

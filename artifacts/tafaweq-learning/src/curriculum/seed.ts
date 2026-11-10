/**
 * بذر المحتوى الموثّق: يُحوّل محتوى الرياضيات للصف العاشر (8 وحدات / 32 درسًا / 160 سؤالًا)
 * إلى نموذج المنهاج الجديد داخل الصف العاشر، الفصل الأول للوحدات 1–4 والفصل الثاني للوحدات 5–8.
 *
 * هذا هو المحتوى الوحيد الموثّق مسبقًا؛ بقية الصفوف والمواد تُستورد من ملفات رسمية.
 */
import { MATH10_UNITS } from '../data/math10';
import type { MathQuestion } from '../data/math10';
import { stableId } from './keys';
import type {
  CurriculumGrade,
  CurriculumLesson,
  CurriculumQuestion,
  CurriculumState,
  CurriculumSubject,
  CurriculumUnit,
} from './types';

const MATH_SUBJECT_TITLE = 'الرياضيات';
const GRADE_NUMBER = 10;

function toCurriculumQuestion(question: MathQuestion, lessonId: string): CurriculumQuestion {
  const source = question.page
    ? `كتاب الطالب — صفحة ${question.page}`
    : 'كتاب الطالب — الرياضيات للصف العاشر';
  return {
    id: stableId('q', `${lessonId}|${question.prompt}`),
    kind: question.kind === 'truefalse' ? 'true_false' : 'mcq',
    prompt: question.prompt,
    options: [...question.options],
    correctOption: question.correctOption,
    explanation: question.explanation,
    difficulty: question.level ?? 'medium',
    source,
  };
}

function toCurriculumLesson(
  unit: MathUnitLike,
  unitId: string,
  lesson: MathUnitLike['lessons'][number],
  index: number,
): CurriculumLesson {
  const lessonId = stableId('l', `${unitId}|${lesson.title}|${index}`);
  return {
    id: lessonId,
    title: lesson.title,
    objective: lesson.objective,
    explanation: lesson.explanation,
    page: lesson.page ? String(lesson.page) : '',
    source: lesson.page
      ? `كتاب الطالب — صفحة ${lesson.page}`
      : `كتاب الطالب — ${unit.title}`,
    questions: lesson.questions.map((question) => toCurriculumQuestion(question, lessonId)),
  };
}

interface MathUnitLike {
  title: string;
  lessons: Array<{
    title: string;
    page?: number;
    objective: string;
    explanation: string;
    questions: MathQuestion[];
  }>;
}

/** يضيف محتوى الرياضيات للصف العاشر إن لم يكن موجودًا، دون المساس بأي تعديل إداري. */
export function seedMathContent(state: CurriculumState): CurriculumState {
  const grade = state.grades.find((entry) => entry.gradeNumber === GRADE_NUMBER);
  if (!grade) return state;
  let subject = grade.subjects.find((entry) => entry.title === MATH_SUBJECT_TITLE && !entry.stream);
  if (!subject) {
    subject = {
      id: stableId('sub', `${GRADE_NUMBER}||${MATH_SUBJECT_TITLE}`),
      title: MATH_SUBJECT_TITLE,
      stream: '',
      note: 'محتوى موثّق من كتاب الطالب — الرياضيات للصف العاشر.',
      semesters: [
        { number: 1, units: [] },
        { number: 2, units: [] },
      ],
    } satisfies CurriculumSubject;
    grade.subjects.unshift(subject);
  }

  const alreadySeeded = subject.semesters.some((semester) => semester.units.length > 0);
  if (alreadySeeded) return state;

  MATH10_UNITS.forEach((unit, unitIndex) => {
    const semesterNumber = unitIndex < 4 ? 1 : 2;
    const semester = subject!.semesters.find((entry) => entry.number === semesterNumber);
    if (!semester) return;
    const unitId = stableId('u', `${subject!.id}|${semesterNumber}|${unit.title}`);
    const curriculumUnit: CurriculumUnit = {
      id: unitId,
      title: unit.title,
      lessons: (unit as unknown as MathUnitLike).lessons.map((lesson, lessonIndex) =>
        toCurriculumLesson(unit as unknown as MathUnitLike, unitId, lesson, lessonIndex),
      ),
    };
    semester.units.push(curriculumUnit);
  });

  return state;
}

/** يُنشئ صفوفًا مفقودة فقط — يحترم أي حذف إداري سابق. */
export function mergeMissingGrades(state: CurriculumState, catalog: CurriculumGrade[]): CurriculumState {
  const existing = new Set(state.grades.map((grade) => grade.gradeNumber));
  const additions = catalog.filter((grade) => !existing.has(grade.gradeNumber));
  if (!additions.length) return state;
  return {
    ...state,
    grades: [...state.grades, ...additions].sort((a, b) => a.gradeNumber - b.gradeNumber),
  };
}

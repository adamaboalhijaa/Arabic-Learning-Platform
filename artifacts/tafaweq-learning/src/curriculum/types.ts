/**
 * نموذج بيانات المنهاج الكامل: الصف ← المادة ← الفصل الدراسي ← الوحدة ← الدرس ← السؤال.
 *
 * كل عنصر له معرّف ثابت مشتق من مساره، ويُستخدم لمنع التكرار عند الاستيراد
 * المجمّع من ملفات CSV أو JSON.
 */
export type QuestionKind = 'mcq' | 'true_false';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type SemesterNumber = 1 | 2;

export interface CurriculumQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  /** مرجع الكتاب الرسمي (صفحة/درس) — إلزامي عند الاستيراد. */
  source: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  objective: string;
  explanation: string;
  page: string;
  source: string;
  questions: CurriculumQuestion[];
}

export interface CurriculumUnit {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumSemester {
  number: SemesterNumber;
  units: CurriculumUnit[];
}

export interface CurriculumSubject {
  id: string;
  title: string;
  /** الفرع في المرحلة الثانوية (علمي/أدبي)، فارغ للمراحل الأخرى. */
  stream: string;
  note: string;
  semesters: CurriculumSemester[];
}

export interface CurriculumGrade {
  gradeNumber: number;
  title: string;
  stage: string;
  subjects: CurriculumSubject[];
}

export interface CurriculumState {
  version: number;
  updatedAt: string;
  grades: CurriculumGrade[];
}

/** أعداد المحتوى لمادة واحدة أو لصف كامل. */
export interface ContentCounts {
  units: number;
  lessons: number;
  questions: number;
  lessonsWithoutQuestions: number;
  questionsWithoutExplanation: number;
  questionsWithoutDifficulty: number;
  questionsWithoutSource: number;
}

export interface SubjectStats extends ContentCounts {
  subjectId: string;
  title: string;
  stream: string;
  completion: number;
  semesterUnits: [number, number];
  criteria: Array<{ label: string; met: boolean }>;
}

export interface GradeStats {
  gradeNumber: number;
  title: string;
  stage: string;
  subjectCount: number;
  counts: ContentCounts;
  completion: number;
  subjects: SubjectStats[];
}

export const QUESTION_KIND_LABELS: Record<QuestionKind, string> = {
  mcq: 'اختيار من متعدد',
  true_false: 'صح وخطأ',
};

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

export const SEMESTER_LABELS: Record<SemesterNumber, string> = {
  1: 'الفصل الأول',
  2: 'الفصل الثاني',
};

export const TRUE_FALSE_OPTIONS = ['صح', 'خطأ'] as const;

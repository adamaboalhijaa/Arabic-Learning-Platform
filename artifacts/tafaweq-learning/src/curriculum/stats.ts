/** إحصاءات الإنجاز لكل مادة وصف، مع معايير شفافة تُعرض في لوحة المشرف. */
import type {
  ContentCounts,
  CurriculumGrade,
  CurriculumState,
  CurriculumSubject,
  GradeStats,
  SubjectStats,
} from './types';

function emptyCounts(): ContentCounts {
  return {
    units: 0,
    lessons: 0,
    questions: 0,
    lessonsWithoutQuestions: 0,
    questionsWithoutExplanation: 0,
    questionsWithoutDifficulty: 0,
    questionsWithoutSource: 0,
  };
}

export function countSubject(subject: CurriculumSubject): ContentCounts {
  const counts = emptyCounts();
  for (const semester of subject.semesters) {
    for (const unit of semester.units) {
      counts.units += 1;
      for (const lesson of unit.lessons) {
        counts.lessons += 1;
        if (!lesson.questions.length) counts.lessonsWithoutQuestions += 1;
        for (const question of lesson.questions) {
          counts.questions += 1;
          if (!question.explanation.trim()) counts.questionsWithoutExplanation += 1;
          if (!question.difficulty) counts.questionsWithoutDifficulty += 1;
          if (!question.source.trim()) counts.questionsWithoutSource += 1;
        }
      }
    }
  }
  return counts;
}

export function subjectStats(subject: CurriculumSubject): SubjectStats {
  const counts = countSubject(subject);
  const semesterOne = subject.semesters.find((semester) => semester.number === 1)?.units.length ?? 0;
  const semesterTwo = subject.semesters.find((semester) => semester.number === 2)?.units.length ?? 0;

  const criteria = [
    { label: 'وحدات في الفصل الأول', met: semesterOne > 0 },
    { label: 'وحدات في الفصل الثاني', met: semesterTwo > 0 },
    { label: 'كل وحدة تحتوي دروسًا', met: counts.units > 0 && counts.lessons >= counts.units },
    { label: 'كل درس يحتوي أسئلة', met: counts.lessons > 0 && counts.lessonsWithoutQuestions === 0 },
    { label: 'شرح لكل سؤال', met: counts.questions > 0 && counts.questionsWithoutExplanation === 0 },
    { label: 'مستوى صعوبة لكل سؤال', met: counts.questions > 0 && counts.questionsWithoutDifficulty === 0 },
    { label: 'مرجع مصدر لكل سؤال', met: counts.questions > 0 && counts.questionsWithoutSource === 0 },
    { label: 'لا عناوين مكررة', met: !hasDuplicateTitles(subject) },
  ];
  const met = criteria.filter((criterion) => criterion.met).length;

  return {
    ...counts,
    subjectId: subject.id,
    title: subject.title,
    stream: subject.stream,
    completion: Math.round((met / criteria.length) * 100),
    semesterUnits: [semesterOne, semesterTwo],
    criteria,
  };
}

export function hasDuplicateTitles(subject: CurriculumSubject): boolean {
  for (const semester of subject.semesters) {
    const unitTitles = new Set<string>();
    for (const unit of semester.units) {
      const key = unit.title.trim();
      if (unitTitles.has(key)) return true;
      unitTitles.add(key);
      const lessonTitles = new Set<string>();
      for (const lesson of unit.lessons) {
        const lessonKey = lesson.title.trim();
        if (lessonTitles.has(lessonKey)) return true;
        lessonTitles.add(lessonKey);
        const prompts = new Set<string>();
        for (const question of lesson.questions) {
          const promptKey = question.prompt.trim();
          if (prompts.has(promptKey)) return true;
          prompts.add(promptKey);
        }
      }
    }
  }
  return false;
}

export function gradeStats(grade: CurriculumGrade): GradeStats {
  const counts = emptyCounts();
  const subjects = grade.subjects.map((subject) => subjectStats(subject));
  for (const subject of subjects) {
    counts.units += subject.units;
    counts.lessons += subject.lessons;
    counts.questions += subject.questions;
    counts.lessonsWithoutQuestions += subject.lessonsWithoutQuestions;
    counts.questionsWithoutExplanation += subject.questionsWithoutExplanation;
    counts.questionsWithoutDifficulty += subject.questionsWithoutDifficulty;
    counts.questionsWithoutSource += subject.questionsWithoutSource;
  }
  const completion = subjects.length
    ? Math.round(subjects.reduce((sum, subject) => sum + subject.completion, 0) / subjects.length)
    : 0;
  return {
    gradeNumber: grade.gradeNumber,
    title: grade.title,
    stage: grade.stage,
    subjectCount: subjects.length,
    counts,
    completion,
    subjects,
  };
}

export interface OverallStats extends ContentCounts {
  grades: number;
  subjects: number;
  completion: number;
}

export function overallStats(state: CurriculumState): OverallStats {
  const totals = emptyCounts();
  let subjects = 0;
  let completionSum = 0;
  for (const grade of state.grades) {
    const stats = gradeStats(grade);
    subjects += stats.subjectCount;
    completionSum += stats.completion * stats.subjectCount;
    totals.units += stats.counts.units;
    totals.lessons += stats.counts.lessons;
    totals.questions += stats.counts.questions;
    totals.lessonsWithoutQuestions += stats.counts.lessonsWithoutQuestions;
    totals.questionsWithoutExplanation += stats.counts.questionsWithoutExplanation;
    totals.questionsWithoutDifficulty += stats.counts.questionsWithoutDifficulty;
    totals.questionsWithoutSource += stats.counts.questionsWithoutSource;
  }
  return {
    ...totals,
    grades: state.grades.length,
    subjects,
    completion: subjects ? Math.round(completionSum / subjects) : 0,
  };
}

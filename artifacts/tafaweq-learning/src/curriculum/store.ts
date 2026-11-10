/**
 * مخزن المنهاج: قراءة/كتابة في المتصفح، عمليات إضافة وتعديل وحذف، واستيراد مجمّع.
 * لا يمسّ تقدّم الطلاب أو نقاط XP: تلك محفوظة في مفاتيح تخزين مستقلة.
 */
import { useSyncExternalStore } from 'react';
import { buildCatalog, gradeTitle, stageOf } from './catalog';
import { runImport, type ImportMode, type ImportPlan } from './import';
import { normalizeKey, stableId } from './keys';
import { mergeMissingGrades, seedMathContent } from './seed';
import { CURRICULUM_EVENT, CURRICULUM_STORAGE_KEY, CURRICULUM_VERSION } from './store-constants';
import type {
  CurriculumGrade,
  CurriculumLesson,
  CurriculumQuestion,
  CurriculumState,
  CurriculumSubject,
  CurriculumUnit,
  QuestionDifficulty,
  QuestionKind,
  SemesterNumber,
} from './types';

let cache: CurriculumState | null = null;

export function createInitialState(): CurriculumState {
  const base: CurriculumState = {
    version: CURRICULUM_VERSION,
    updatedAt: new Date().toISOString(),
    grades: buildCatalog(),
  };
  return seedMathContent(base);
}

function clone(state: CurriculumState): CurriculumState {
  return JSON.parse(JSON.stringify(state)) as CurriculumState;
}

function persist(state: CurriculumState): void {
  cache = state;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* التخزين قد يكون ممتلئًا أو معطلًا؛ تبقى الحالة في الذاكرة */
  }
  window.dispatchEvent(new Event(CURRICULUM_EVENT));
}

function readStored(): CurriculumState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurriculumState;
    if (!parsed || !Array.isArray(parsed.grades) || !parsed.grades.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function migrate(state: CurriculumState): CurriculumState {
  let next = state;
  if (next.version !== CURRICULUM_VERSION) {
    next = mergeMissingGrades({ ...next, version: CURRICULUM_VERSION }, buildCatalog());
  }
  next = seedMathContent(clone(next));
  persist(next);
  return next;
}

export function getCurriculum(): CurriculumState {
  if (cache) return cache;
  const stored = readStored();
  if (!stored) {
    const initial = createInitialState();
    persist(initial);
    return initial;
  }
  cache = stored;
  return migrate(stored);
}

export function subscribe(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CURRICULUM_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CURRICULUM_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function useCurriculum(): CurriculumState {
  return useSyncExternalStore(subscribe, getCurriculum, getCurriculum);
}

function commit(next: CurriculumState): CurriculumState {
  const state = { ...next, updatedAt: new Date().toISOString() };
  persist(state);
  return state;
}

export function mutate(mutator: (draft: CurriculumState) => void): CurriculumState {
  const draft = clone(getCurriculum());
  mutator(draft);
  return commit(draft);
}

function findSubject(state: CurriculumState, subjectId: string): { grade: CurriculumGrade; subject: CurriculumSubject } | null {
  for (const grade of state.grades) {
    const subject = grade.subjects.find((entry) => entry.id === subjectId);
    if (subject) return { grade, subject };
  }
  return null;
}

function findSemester(subject: CurriculumSubject, number: SemesterNumber) {
  let semester = subject.semesters.find((entry) => entry.number === number);
  if (!semester) {
    semester = { number, units: [] };
    subject.semesters.push(semester);
    subject.semesters.sort((a, b) => a.number - b.number);
  }
  return semester;
}

function findUnit(subject: CurriculumSubject, unitId: string): { unit: CurriculumUnit; semester: SemesterNumber } | null {
  for (const semester of subject.semesters) {
    const unit = semester.units.find((entry) => entry.id === unitId);
    if (unit) return { unit, semester: semester.number };
  }
  return null;
}

function findLesson(subject: CurriculumSubject, lessonId: string): { lesson: CurriculumLesson; unit: CurriculumUnit } | null {
  for (const semester of subject.semesters) {
    for (const unit of semester.units) {
      const lesson = unit.lessons.find((entry) => entry.id === lessonId);
      if (lesson) return { lesson, unit };
    }
  }
  return null;
}

/* ---------------------------------- صفوف ---------------------------------- */

export function updateGrade(gradeNumber: number, patch: { title?: string; stage?: string }): void {
  mutate((draft) => {
    const grade = draft.grades.find((entry) => entry.gradeNumber === gradeNumber);
    if (!grade) return;
    if (patch.title !== undefined) grade.title = patch.title.trim() || gradeTitle(gradeNumber);
    if (patch.stage !== undefined) grade.stage = patch.stage.trim() || stageOf(gradeNumber);
  });
}

/* --------------------------------- مواد ---------------------------------- */

export function addSubject(gradeNumber: number, title: string, stream = ''): void {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;
  mutate((draft) => {
    const grade = draft.grades.find((entry) => entry.gradeNumber === gradeNumber);
    if (!grade) return;
    const exists = grade.subjects.some(
      (subject) => normalizeKey(subject.title) === normalizeKey(cleanTitle) && normalizeKey(subject.stream) === normalizeKey(stream),
    );
    if (exists) return;
    grade.subjects.push({
      id: stableId('sub', `${gradeNumber}|${stream}|${cleanTitle}`),
      title: cleanTitle,
      stream,
      note: 'أُضيفت يدويًا من لوحة المشرف.',
      semesters: [
        { number: 1, units: [] },
        { number: 2, units: [] },
      ],
    });
  });
}

export function updateSubject(subjectId: string, patch: { title?: string; stream?: string; note?: string }): void {
  mutate((draft) => {
    const found = findSubject(draft, subjectId);
    if (!found) return;
    if (patch.title !== undefined && patch.title.trim()) found.subject.title = patch.title.trim();
    if (patch.stream !== undefined) found.subject.stream = patch.stream.trim();
    if (patch.note !== undefined) found.subject.note = patch.note.trim();
  });
}

export function deleteSubject(subjectId: string): void {
  mutate((draft) => {
    for (const grade of draft.grades) {
      const index = grade.subjects.findIndex((subject) => subject.id === subjectId);
      if (index !== -1) {
        grade.subjects.splice(index, 1);
        return;
      }
    }
  });
}

/* --------------------------------- وحدات ---------------------------------- */

export function addUnit(subjectId: string, semester: SemesterNumber, title: string): void {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;
  mutate((draft) => {
    const found = findSubject(draft, subjectId);
    if (!found) return;
    const target = findSemester(found.subject, semester);
    const exists = target.units.some((unit) => normalizeKey(unit.title) === normalizeKey(cleanTitle));
    if (exists) return;
    target.units.push({ id: stableId('u', `${subjectId}|${semester}|${cleanTitle}`), title: cleanTitle, lessons: [] });
  });
}

export function updateUnit(subjectId: string, unitId: string, title: string): void {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;
  mutate((draft) => {
    const found = findSubject(draft, subjectId);
    if (!found) return;
    const target = findUnit(found.subject, unitId);
    if (target) target.unit.title = cleanTitle;
  });
}

export function deleteUnit(subjectId: string, unitId: string): void {
  mutate((draft) => {
    const found = findSubject(draft, subjectId);
    if (!found) return;
    for (const semester of found.subject.semesters) {
      const index = semester.units.findIndex((unit) => unit.id === unitId);
      if (index !== -1) {
        semester.units.splice(index, 1);
        return;
      }
    }
  });
}

/* --------------------------------- دروس ----------------------------------- */

export function addLesson(subjectId: string, unitId: string, title: string): void {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;
  mutate((draft) => {
    const found = findSubject(draft, subjectId);
    if (!found) return;
    const target = findUnit(found.subject, unitId);
    if (!target) return;
    const exists = target.unit.lessons.some((lesson) => normalizeKey(lesson.title) === normalizeKey(cleanTitle));
    if (exists) return;
    target.unit.lessons.push({
      id: stableId('l', `${unitId}|${cleanTitle}`),
      title: cleanTitle,
      objective: '',
      explanation: '',
      page: '',
      source: '',
      questions: [],
    });
  });
}

export function updateLesson(
  subjectId: string,
  lessonId: string,
  patch: Partial<Pick<CurriculumLesson, 'title' | 'objective' | 'explanation' | 'page' | 'source'>>,
): void {
  mutate((draft) => {
    const found = findSubject(draft, subjectId);
    if (!found) return;
    const target = findLesson(found.subject, lessonId);
    if (!target) return;
    if (patch.title !== undefined && patch.title.trim()) target.lesson.title = patch.title.trim();
    if (patch.objective !== undefined) target.lesson.objective = patch.objective.trim();
    if (patch.explanation !== undefined) target.lesson.explanation = patch.explanation.trim();
    if (patch.page !== undefined) target.lesson.page = patch.page.trim();
    if (patch.source !== undefined) target.lesson.source = patch.source.trim();
  });
}

export function deleteLesson(subjectId: string, lessonId: string): void {
  mutate((draft) => {
    const found = findSubject(draft, subjectId);
    if (!found) return;
    for (const semester of found.subject.semesters) {
      for (const unit of semester.units) {
        const index = unit.lessons.findIndex((lesson) => lesson.id === lessonId);
        if (index !== -1) {
          unit.lessons.splice(index, 1);
          return;
        }
      }
    }
  });
}

/* -------------------------------- أسئلة ----------------------------------- */

export interface QuestionDraft {
  kind: QuestionKind;
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  source: string;
}

function buildQuestion(lessonId: string, draft: QuestionDraft): CurriculumQuestion {
  return {
    id: stableId('q', `${lessonId}|${draft.prompt}`),
    kind: draft.kind,
    prompt: draft.prompt.trim(),
    options: draft.options.map((option) => option.trim()),
    correctOption: draft.correctOption,
    explanation: draft.explanation.trim(),
    difficulty: draft.difficulty,
    source: draft.source.trim(),
  };
}

export function addQuestion(subjectId: string, lessonId: string, draft: QuestionDraft): boolean {
  if (!draft.prompt.trim()) return false;
  let added = false;
  mutate((draftState) => {
    const found = findSubject(draftState, subjectId);
    if (!found) return;
    const target = findLesson(found.subject, lessonId);
    if (!target) return;
    const exists = target.lesson.questions.some(
      (question) => normalizeKey(question.prompt) === normalizeKey(draft.prompt),
    );
    if (exists) return;
    target.lesson.questions.push(buildQuestion(lessonId, draft));
    added = true;
  });
  return added;
}

export function updateQuestion(subjectId: string, questionId: string, draft: QuestionDraft): void {
  mutate((draftState) => {
    const found = findSubject(draftState, subjectId);
    if (!found) return;
    for (const semester of found.subject.semesters) {
      for (const unit of semester.units) {
        for (const lesson of unit.lessons) {
          const index = lesson.questions.findIndex((question) => question.id === questionId);
          if (index === -1) continue;
          lesson.questions[index] = { ...buildQuestion(lesson.id, draft), id: questionId };
          return;
        }
      }
    }
  });
}

export function deleteQuestion(subjectId: string, questionId: string): void {
  mutate((draftState) => {
    const found = findSubject(draftState, subjectId);
    if (!found) return;
    for (const semester of found.subject.semesters) {
      for (const unit of semester.units) {
        for (const lesson of unit.lessons) {
          const index = lesson.questions.findIndex((question) => question.id === questionId);
          if (index !== -1) {
            lesson.questions.splice(index, 1);
            return;
          }
        }
      }
    }
  });
}

/* ------------------------------- الاستيراد -------------------------------- */

export function importRows(rows: Array<Record<string, string>>, mode: ImportMode): ImportPlan {
  const result = runImport(getCurriculum(), rows, mode);
  if (result.plan.canApply) {
    const total =
      result.plan.creates.units +
      result.plan.creates.lessons +
      result.plan.creates.questions +
      result.plan.updates.questions;
    if (total > 0) commit(result.state);
  }
  return result.plan;
}

export function replaceCurriculum(next: CurriculumState): void {
  commit({ ...next, version: CURRICULUM_VERSION });
}

export function resetCurriculum(): CurriculumState {
  const initial = createInitialState();
  persist(initial);
  return initial;
}

export function exportCurriculum(): string {
  return JSON.stringify(getCurriculum(), null, 2);
}

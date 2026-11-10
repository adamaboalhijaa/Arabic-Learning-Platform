import { useSyncExternalStore } from 'react';

// حفظ تقدم الطالب في قسم الرياضيات محليًا على جهازه، مع نظام XP ومستويات.
// يعمل دون تسجيل دخول، ويُحدَّث فورًا بعد كل إجابة.

const STORAGE_KEY = 'tafaweq.math10.progress.v1';

export const XP_PER_CORRECT = 10;
export const XP_MASTERY_BONUS = 15;
export const XP_PERFECT_BONUS = 25;
export const MASTERY_RATIO = 0.6;

export interface LessonProgress {
  lessonId: string;
  bestCorrect: number;
  total: number;
  attempts: number;
  mastered: boolean;
  perfect: boolean;
  lastAttemptAt: string;
}

export interface AnswerRecord {
  questionId: string;
  correct: boolean;
  attempts: number;
  lastAt: string;
}

export interface QuizResult {
  lessonId: string;
  correct: number;
  total: number;
  xpEarned: number;
  at: string;
}

export interface MathProgress {
  version: 1;
  xp: number;
  lessons: Record<string, LessonProgress>;
  answers: Record<string, AnswerRecord>;
  results: QuizResult[];
  updatedAt: string;
}

const EMPTY: MathProgress = {
  version: 1,
  xp: 0,
  lessons: {},
  answers: {},
  results: [],
  updatedAt: '',
};

let state: MathProgress = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sanitize(raw: unknown): MathProgress {
  if (!raw || typeof raw !== 'object') return { ...EMPTY };
  const value = raw as Partial<MathProgress>;
  return {
    version: 1,
    xp: typeof value.xp === 'number' && Number.isFinite(value.xp) && value.xp > 0 ? Math.round(value.xp) : 0,
    lessons: value.lessons && typeof value.lessons === 'object' ? value.lessons : {},
    answers: value.answers && typeof value.answers === 'object' ? value.answers : {},
    results: Array.isArray(value.results) ? value.results.slice(-40) : [],
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function read(): MathProgress {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...EMPTY };
  }
}

function persist(next: MathProgress) {
  state = next;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // إذا كان التخزين ممتلئًا أو معطّلًا نُبقي الحالة في الذاكرة لهذه الجلسة.
    }
  }
  listeners.forEach((listener) => listener());
}

export function getProgress(): MathProgress {
  if (!loaded) {
    state = read();
    loaded = true;
  }
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMathProgress(): MathProgress {
  return useSyncExternalStore(subscribe, getProgress, () => EMPTY);
}

/** تسجيل إجابة سؤال: يمنح XP عند أول إجابة صحيحة فقط. */
export function recordAnswer(questionId: string, correct: boolean): number {
  const current = getProgress();
  const previous = current.answers[questionId];
  const firstCorrect = correct && !previous?.correct;
  const gained = firstCorrect ? XP_PER_CORRECT : 0;

  persist({
    ...current,
    xp: current.xp + gained,
    answers: {
      ...current.answers,
      [questionId]: {
        questionId,
        correct: Boolean(previous?.correct || correct),
        attempts: (previous?.attempts ?? 0) + 1,
        lastAt: new Date().toISOString(),
      },
    },
    updatedAt: new Date().toISOString(),
  });

  return gained;
}

/** إتمام اختبار درس: يحفظ النتيجة ويمنح مكافآت الإتقان لمرة واحدة. */
export function completeLesson(lessonId: string, correct: number, total: number): number {
  const current = getProgress();
  const previous = current.lessons[lessonId];
  const ratio = total > 0 ? correct / total : 0;
  const mastered = ratio >= MASTERY_RATIO;
  const perfect = total > 0 && correct === total;

  let gained = 0;
  if (mastered && !previous?.mastered) gained += XP_MASTERY_BONUS;
  if (perfect && !previous?.perfect) gained += XP_PERFECT_BONUS;

  persist({
    ...current,
    xp: current.xp + gained,
    lessons: {
      ...current.lessons,
      [lessonId]: {
        lessonId,
        bestCorrect: Math.max(previous?.bestCorrect ?? 0, correct),
        total,
        attempts: (previous?.attempts ?? 0) + 1,
        mastered: Boolean(previous?.mastered || mastered),
        perfect: Boolean(previous?.perfect || perfect),
        lastAttemptAt: new Date().toISOString(),
      },
    },
    results: [
      ...current.results,
      { lessonId, correct, total, xpEarned: gained, at: new Date().toISOString() },
    ].slice(-40),
    updatedAt: new Date().toISOString(),
  });

  return gained;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextMinXp: number | null;
  progress: number;
  remaining: number;
}

const LEVELS = [
  { level: 1, title: 'مبتدئ', minXp: 0 },
  { level: 2, title: 'متعلّم', minXp: 100 },
  { level: 3, title: 'متمكّن', minXp: 250 },
  { level: 4, title: 'متقدّم', minXp: 450 },
  { level: 5, title: 'خبير', minXp: 700 },
  { level: 6, title: 'متفوّق', minXp: 1000 },
  { level: 7, title: 'متفوّق ذهبي', minXp: 1400 },
] as const;

export function levelInfo(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (xp >= LEVELS[i].minXp) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const span = next ? next.minXp - current.minXp : 0;
  const progress = next ? Math.min(100, Math.round(((xp - current.minXp) / span) * 100)) : 100;

  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextMinXp: next ? next.minXp : null,
    progress,
    remaining: next ? Math.max(0, next.minXp - xp) : 0,
  };
}

export function lessonStatus(progress: MathProgress, lessonId: string): LessonProgress | undefined {
  return progress.lessons[lessonId];
}

/** نسبة إنجاز درس: أفضل نتيجة محفوظة، أو 0 إذا لم يُحلّ بعد. */
export function lessonScore(progress: MathProgress, lessonId: string, total: number): number {
  const record = progress.lessons[lessonId];
  if (!record || total <= 0) return 0;
  return Math.round((record.bestCorrect / total) * 100);
}

export function resetProgress() {
  persist({ ...EMPTY, updatedAt: new Date().toISOString() });
}

/** يُستدعى من الاختبارات للتأكد من قراءة أحدث نسخة من التخزين. */
export function reloadProgress() {
  loaded = false;
  state = read();
  listeners.forEach((listener) => listener());
}

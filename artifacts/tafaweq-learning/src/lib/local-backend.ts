/**
 * طبقة بيانات محلية احتياطية.
 *
 * السبب: النسخة المنشورة تطبيق ثابت (nginx) بلا خادم API، فكل طلب إلى /api
 * يعيد ملف HTML بدل JSON، فتفشل صفحات المنهاج والاختبارات وتبدو الأزرار معطلة.
 * هذه الطبقة تحاول الطلب الحقيقي أولًا، وإذا لم يكن ردًا JSON صالحًا تُجيب من
 * بيانات الرياضيات المحلية (MATH10) وتقدّم الطالب المحفوظ في المتصفح.
 *
 * لا تغيّر أي تصميم: الردود مطابقة لأشكال الـ API نفسها.
 */
import { MATH10_UNITS } from '../data/math10';
import type { MathLesson, MathUnit } from '../data/math10';
import { XP_PER_CORRECT, getProgress, lessonScore, levelInfo } from './math-progress';
import { readLocalStudent } from './local-session';

const GRADE_ID = 10;
const SUBJECT_ID = 1001;
const UNIT_BASE = 2000;
const LESSON_BASE = 3000;
const QUESTION_BASE = 40000;
const MASTERY_RATIO = 0.6;

interface LessonEntry {
  numericId: number;
  lesson: MathLesson;
  unit: MathUnit;
  unitId: number;
}

const lessonEntries: LessonEntry[] = [];
const unitEntries = MATH10_UNITS.map((unit, unitIndex) => {
  const unitId = UNIT_BASE + unitIndex;
  unit.lessons.forEach((lesson) => {
    lessonEntries.push({ numericId: LESSON_BASE + lessonEntries.length, lesson, unit, unitId });
  });
  return { numericId: unitId, unit, position: unitIndex };
});

function lessonEntry(numericId: number): LessonEntry | undefined {
  return lessonEntries.find((entry) => entry.numericId === numericId);
}

function questionIdFor(lessonId: number, questionIndex: number): number {
  const entry = lessonEntry(lessonId);
  if (!entry) return QUESTION_BASE + questionIndex;
  return QUESTION_BASE + lessonEntries.indexOf(entry) * 100 + questionIndex;
}

function lessonPayload(entry: LessonEntry) {
  const progress = getProgress();
  const total = entry.lesson.questions.length;
  const bestScore = lessonScore(progress, entry.lesson.id, total);
  return {
    id: entry.numericId,
    unitId: entry.unitId,
    title: entry.lesson.title,
    description: entry.lesson.objective,
    objective: entry.lesson.objective,
    explanation: entry.lesson.explanation,
    objectives: entry.lesson.objectives,
    durationMinutes: entry.lesson.durationMinutes,
    contentStatus: 'verified' as const,
    sourceReference: `كتاب الطالب — صفحة ${entry.lesson.page}`,
    questionCount: total,
    isCompleted: bestScore >= Math.round(MASTERY_RATIO * 100),
    bestScore: bestScore > 0 ? bestScore : null,
    unitTitle: entry.unit.title,
    subjectTitle: 'الرياضيات',
    gradeNumber: GRADE_ID,
  };
}

function quizPayload(entry: LessonEntry) {
  return entry.lesson.questions.map((question, index) => ({
    id: questionIdFor(entry.numericId, index),
    prompt: question.prompt,
    kind: question.kind === 'truefalse' ? ('true_false' as const) : ('multiple_choice' as const),
    options: question.options,
    position: index,
  }));
}

function profilePayload() {
  const student = readLocalStudent();
  const progress = getProgress();
  return {
    id: 1,
    displayName: student?.name ?? 'طالب',
    gradeId: GRADE_ID,
    gradeTitle: 'الصف العاشر',
    totalXp: progress.xp,
    level: levelInfo(progress.xp).level,
    streakDays: 0,
    role: 'student' as const,
    status: 'active' as const,
  };
}

function progressPayload() {
  const progress = getProgress();
  return lessonEntries
    .map((entry) => {
      const total = entry.lesson.questions.length;
      const bestScore = lessonScore(progress, entry.lesson.id, total);
      if (bestScore <= 0) return null;
      return {
        lessonId: entry.numericId,
        lessonTitle: entry.lesson.title,
        unitTitle: entry.unit.title,
        subjectTitle: 'الرياضيات',
        gradeNumber: GRADE_ID,
        bestScore,
        attempts: 1,
        lastAttemptAt: new Date().toISOString(),
        isCompleted: bestScore >= Math.round(MASTERY_RATIO * 100),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function selectedOptionOf(answer: unknown): number {
  if (!answer || typeof answer !== 'object') return -1;
  const record = answer as Record<string, unknown>;
  const raw = record.selectedOption ?? record.selectedIndex ?? record.optionIndex ?? record.answer;
  return typeof raw === 'number' ? raw : -1;
}

function submitAttempt(rawBody: unknown): Response {
  const body = (rawBody ?? {}) as Record<string, unknown>;
  const lessonId = Number(body.lessonId);
  const entry = lessonEntry(lessonId);
  if (!entry) return json({ message: 'الدرس غير موجود' }, 404);
  const answers = Array.isArray(body.answers) ? body.answers : [];

  const results = entry.lesson.questions.map((question, index) => {
    const questionId = questionIdFor(entry.numericId, index);
    const given = answers.find((answer) => Number((answer as Record<string, unknown>)?.questionId) === questionId);
    const selectedOption = selectedOptionOf(given);
    return {
      questionId,
      prompt: question.prompt,
      selectedOption,
      correctOption: question.correctOption,
      isCorrect: selectedOption === question.correctOption,
      explanation: question.explanation,
    };
  });

  const correctAnswers = results.filter((result) => result.isCorrect).length;
  const totalQuestions = results.length;
  const scorePercent = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const earnedXp = correctAnswers * XP_PER_CORRECT;

  return json({
    attemptId: Date.now(),
    totalQuestions,
    correctAnswers,
    scorePercent,
    earnedXp,
    totalXp: getProgress().xp + earnedXp,
    level: levelInfo(getProgress().xp + earnedXp).level,
    streakDays: 1,
    results,
  });
}

function handle(pathname: string, method: string, body: unknown): Response | null {
  const segments = pathname.split('/').filter(Boolean); // ['api', ...]
  const rest = segments.slice(1);

  if (method === 'GET' && rest[0] === 'healthz') return json({ status: 'ok' });

  if (rest[0] === 'curriculum') {
    if (method === 'GET' && rest[1] === 'grades' && rest.length === 2) {
      return json([
        {
          id: GRADE_ID,
          gradeNumber: GRADE_ID,
          title: 'الصف العاشر',
          stage: 'الفصل الأول',
          contentStatus: 'verified',
          subjectCount: 1,
        },
      ]);
    }
    if (method === 'GET' && rest[1] === 'grades' && rest[3] === 'subjects') {
      return json([
        {
          id: SUBJECT_ID,
          gradeId: GRADE_ID,
          title: 'الرياضيات',
          description: 'كتاب الطالب — الرياضيات للصف العاشر، الفصل الأول',
          unitCount: MATH10_UNITS.length,
        },
      ]);
    }
    if (method === 'GET' && rest[1] === 'subjects' && rest[3] === 'units') {
      return json(
        unitEntries.map((entry) => ({
          id: entry.numericId,
          subjectId: SUBJECT_ID,
          title: entry.unit.title,
          position: entry.position,
          contentStatus: 'verified',
          lessonCount: entry.unit.lessons.length,
        })),
      );
    }
    if (method === 'GET' && rest[1] === 'units' && rest[3] === 'lessons') {
      const unitId = Number(rest[2]);
      const entry = unitEntries.find((item) => item.numericId === unitId);
      if (!entry) return json({ message: 'الوحدة غير موجودة' }, 404);
      return json(
        lessonEntries.filter((item) => item.unitId === unitId).map((item) => lessonPayload(item)),
      );
    }
    return null;
  }

  if (rest[0] === 'lessons' && method === 'GET') {
    const lessonId = Number(rest[1]);
    const entry = lessonEntry(lessonId);
    if (!entry) return json({ message: 'الدرس غير موجود' }, 404);
    if (rest[2] === 'quiz') return json(quizPayload(entry));
    if (rest.length === 2) return json(lessonPayload(entry));
    return null;
  }

  if (rest[0] === 'quiz-attempts' && method === 'POST') return submitAttempt(body);

  if (rest[0] === 'me') {
    if (method === 'GET' && rest[1] === 'dashboard') {
      const profile = profilePayload();
      const completed = progressPayload().filter((row) => row.isCompleted).length;
      return json({
        profile,
        totalLessons: lessonEntries.length,
        completedLessons: completed,
        dailyGoal: {
          targetXp: 50,
          earnedXp: Math.min(profile.totalXp % 50, 50),
          met: profile.totalXp > 0 && profile.totalXp % 50 === 0,
        },
        continueLearning: lessonEntries
          .filter((entry) => lessonPayload(entry).bestScore === null)
          .slice(0, 3)
          .map((entry) => lessonPayload(entry)),
        recentActivity: [],
        achievements: [],
        contentNotice: 'المحتوى المعروض من بيانات الرياضيات المحلية للصف العاشر.',
      });
    }
    if (method === 'GET' && rest[1] === 'progress') return json(progressPayload());
    if (method === 'GET' && rest.length === 1) return json(profilePayload());
    if ((method === 'PATCH' || method === 'PUT') && rest.length === 1) return json(profilePayload());
    return null;
  }

  if (rest[0] === 'leaderboard' && method === 'GET') {
    const profile = profilePayload();
    return json([
      {
        rank: 1,
        displayName: profile.displayName,
        gradeTitle: profile.gradeTitle,
        totalXp: profile.totalXp,
        level: profile.level,
      },
    ]);
  }

  if (rest[0] === 'admin') {
    if (method === 'GET' && rest[1] === 'overview') {
      return json({
        studentCount: 1,
        gradeCount: 1,
        subjectCount: 1,
        unitCount: MATH10_UNITS.length,
        lessonCount: lessonEntries.length,
        questionCount: lessonEntries.reduce((sum, entry) => sum + entry.lesson.questions.length, 0),
        draftLessonCount: 0,
        verifiedLessonCount: lessonEntries.length,
      });
    }
    if (method === 'GET') return json([]);
    return json({ message: 'التعديل الإداري غير متاح في النسخة المحلية.' }, 409);
  }

  return null;
}

/** يثبّت الاعتراض مرة واحدة فقط. */
export function installLocalBackend(): void {
  if (typeof window === 'undefined') return;
  const marker = window as unknown as { __tafaweqLocalBackend?: boolean };
  if (marker.__tafaweqLocalBackend) return;
  marker.__tafaweqLocalBackend = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const rawUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const pathname = rawUrl.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    if (!pathname.startsWith('/api/')) return originalFetch(input, init);

    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const body = typeof init?.body === 'string' ? safeJson(init.body) : undefined;

    let real: Response | null = null;
    try {
      real = await originalFetch(input, init);
    } catch {
      real = null;
    }

    const contentType = real?.headers.get('content-type') ?? '';
    if (real && real.ok && contentType.includes('application/json')) return real;

    const fallback = handle(pathname, method, body);
    if (fallback) return fallback;
    return real ?? json({ message: 'خدمة البيانات غير متاحة.' }, 503);
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

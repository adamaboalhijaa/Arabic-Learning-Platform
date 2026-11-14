/**
 * طبقة بيانات محلية احتياطية.
 *
 * السبب: النسخة المنشورة تطبيق ثابت (nginx) بلا خادم API، فكل طلب إلى /api
 * يعيد ملف HTML بدل JSON، فتفشل صفحات المنهاج والاختبارات وتبدو الأزرار معطلة.
 * هذه الطبقة تحاول الطلب الحقيقي أولًا، وإذا لم يكن ردًا JSON صالحًا تُجيب من
 * سجل المنهاج المحلي (كل الصفوف 1–12 + كتب الرياضيات المربوطة) وتقدّم الطالب
 * المحفوظ في المتصفح.
 *
 * لا تغيّر أي تصميم: الردود مطابقة لأشكال الـ API نفسها.
 */
import {
  ALL_LESSONS,
  ALL_QUESTIONS,
  ALL_SUBJECTS,
  ALL_UNITS,
  CURRICULUM_GRADES,
  gradeById,
  gradeHasContent,
  lessonById,
  lessonsOfUnit,
  subjectById,
  subjectsOfGrade,
  unitsOfSubject,
  type BookLesson,
  type BookSubject,
  type BookUnit,
} from './curriculum-books';
import { completeLesson, getProgress, lessonScore, levelInfo, recordAnswer } from './math-progress';
import { readLocalStudent } from './local-session';

const MASTERY_RATIO = 0.6;

function subjectPayload(subject: BookSubject) {
  const units = unitsOfSubject(subject.id);
  return {
    id: subject.id,
    gradeId: subject.gradeNumber,
    title: subject.title,
    description: subject.description,
    stream: subject.stream,
    unitCount: units.length,
    contentStatus: subject.book ? ('verified' as const) : ('draft' as const),
    hasBook: subject.book !== null,
  };
}

function unitPayload(unit: BookUnit) {
  return {
    id: unit.id,
    subjectId: unit.subjectId,
    gradeId: unit.gradeNumber,
    title: unit.unit.title,
    position: unit.position,
    semester: unit.semester,
    contentStatus: 'verified' as const,
    lessonCount: unit.lessonIds.length,
  };
}

function lessonPayload(entry: BookLesson) {
  const progress = getProgress();
  const total = entry.lesson.questions.length;
  const bestScore = lessonScore(progress, entry.lesson.id, total);
  return {
    id: entry.id,
    unitId: entry.unitId,
    subjectId: entry.subjectId,
    gradeId: entry.gradeNumber,
    semester: entry.semester,
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
    unitTitle: unitTitleOf(entry),
    subjectTitle: subjectById(entry.subjectId)?.title ?? '',
    gradeNumber: entry.gradeNumber,
  };
}

function quizPayload(entry: BookLesson) {
  return entry.lesson.questions.map((question, index) => ({
    id: ALL_QUESTIONS.find(
      (record) => record.lessonId === entry.id && record.index === index,
    )?.id ?? index,
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
    gradeId: 10,
    gradeTitle: 'المنهاج الأردني',
    totalXp: progress.xp,
    level: levelInfo(progress.xp).level,
    streakDays: 0,
    role: 'student' as const,
    status: 'active' as const,
  };
}

function progressPayload() {
  const progress = getProgress();
  return ALL_LESSONS.map((entry) => {
    const total = entry.lesson.questions.length;
    const bestScore = lessonScore(progress, entry.lesson.id, total);
    if (bestScore <= 0) return null;
    return {
      lessonId: entry.id,
      lessonTitle: entry.lesson.title,
      unitTitle: unitTitleOf(entry),
      subjectTitle: subjectById(entry.subjectId)?.title ?? '',
      gradeNumber: entry.gradeNumber,
      bestScore,
      attempts: 1,
      lastAttemptAt: new Date().toISOString(),
      isCompleted: bestScore >= Math.round(MASTERY_RATIO * 100),
    };
  }).filter((row): row is NonNullable<typeof row> => row !== null);
}

function unitTitleOf(entry: BookLesson): string {
  const unit = ALL_UNITS.find((record) => record.id === entry.unitId);
  return unit?.unit.title ?? '';
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
  const entry = lessonById(lessonId);
  if (!entry) return json({ message: 'الدرس غير موجود' }, 404);
  const answers = Array.isArray(body.answers) ? body.answers : [];

  const results = entry.lesson.questions.map((question, index) => {
    const questionId =
      ALL_QUESTIONS.find((record) => record.lessonId === entry.id && record.index === index)?.id ?? index;
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

  // حفظ التقدّم فعليًا: XP لكل إجابة صحيحة أولى + مكافآت الإتقان والكمال للدرس.
  let earnedXp = 0;
  results.forEach((result) => {
    earnedXp += recordAnswer(String(result.questionId), result.isCorrect);
  });
  earnedXp += completeLesson(entry.lesson.id, correctAnswers, totalQuestions);

  const progress = getProgress();

  return json({
    attemptId: Date.now(),
    totalQuestions,
    correctAnswers,
    scorePercent,
    earnedXp,
    totalXp: progress.xp,
    level: levelInfo(progress.xp).level,
    streakDays: 1,
    results,
  });
}

function handle(pathname: string, method: string, body: unknown): Response | null {
  const segments = pathname.split('/').filter(Boolean); // ['api', ...]
  const rest = segments.slice(1);

  if (method === 'GET' && rest[0] === 'healthz') return json({ status: 'ok' });

  if (rest[0] === 'curriculum') {
    // قائمة الصفوف: 1–12 مع حالة المحتوى وعدد المواد.
    if (method === 'GET' && rest[1] === 'grades' && rest.length === 2) {
      return json(
        CURRICULUM_GRADES.map((grade) => ({
          id: grade.gradeNumber,
          gradeNumber: grade.gradeNumber,
          title: grade.title,
          stage: grade.stage,
          contentStatus: gradeHasContent(grade.gradeNumber) ? ('verified' as const) : ('draft' as const),
          subjectCount: grade.subjects.length,
        })),
      );
    }
    // مواد صف واحد.
    if (method === 'GET' && rest[1] === 'grades' && rest[3] === 'subjects') {
      const grade = gradeById(Number(rest[2]));
      if (!grade) return json({ message: 'الصف غير موجود' }, 404);
      return json(subjectsOfGrade(grade.gradeNumber).map(subjectPayload));
    }
    // وحدات مادة (مع رقم الفصل الدراسي في كل وحدة).
    if (method === 'GET' && rest[1] === 'subjects' && rest[3] === 'units') {
      const subject = subjectById(Number(rest[2]));
      if (!subject) return json({ message: 'المادة غير موجودة' }, 404);
      return json(unitsOfSubject(subject.id).map(unitPayload));
    }
    // دروس وحدة.
    if (method === 'GET' && rest[1] === 'units' && rest[3] === 'lessons') {
      const unit = ALL_UNITS.find((item) => item.id === Number(rest[2]));
      if (!unit) return json({ message: 'الوحدة غير موجودة' }, 404);
      return json(lessonsOfUnit(unit.id).map(lessonPayload));
    }
    return null;
  }

  if (rest[0] === 'lessons' && method === 'GET') {
    const entry = lessonById(Number(rest[1]));
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
        totalLessons: ALL_LESSONS.length,
        completedLessons: completed,
        dailyGoal: {
          targetXp: 50,
          earnedXp: Math.min(profile.totalXp % 50, 50),
          met: profile.totalXp > 0 && profile.totalXp % 50 === 0,
        },
        continueLearning: ALL_LESSONS.filter((entry) => lessonPayload(entry).bestScore === null)
          .slice(0, 3)
          .map((entry) => lessonPayload(entry)),
        recentActivity: [],
        achievements: [],
        contentNotice: 'المحتوى المعروض من سجل المنهاج المحلي: كتب الرياضيات المضافة للصف الأول والصف العاشر.',
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
        gradeCount: CURRICULUM_GRADES.length,
        subjectCount: ALL_SUBJECTS.length,
        unitCount: ALL_UNITS.length,
        lessonCount: ALL_LESSONS.length,
        questionCount: ALL_QUESTIONS.length,
        draftLessonCount: 0,
        verifiedLessonCount: ALL_LESSONS.length,
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

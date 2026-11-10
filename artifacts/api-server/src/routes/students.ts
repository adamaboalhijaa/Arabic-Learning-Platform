import { getAuth } from "@clerk/express";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  sql,
} from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetLeaderboardResponse,
  GetMyDashboardResponse,
  GetMyProfileResponse,
  GetMyProgressResponse,
  SubmitQuizAttemptBody,
  SubmitQuizAttemptResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
} from "@workspace/api-zod";
import {
  db,
  gradesTable,
  lessonsTable,
  questionsTable,
  quizAttemptsTable,
  studentAchievementsTable,
  studentAccountsTable,
  subjectsTable,
  unitsTable,
} from "@workspace/db";
import {
  getOrCreateStudentAccount,
  requireActiveStudent,
} from "../middlewares/auth";
import { getLessonRows } from "../lib/lessonQueries";

const router: IRouter = Router();

const achievementCatalog: Record<string, { title: string; description: string }> = {
  first_quiz: {
    title: "أول اختبار",
    description: "أكملت أول اختبار لك.",
  },
  first_lesson: {
    title: "خطوة مكتملة",
    description: "أنهيت درسًا بنتيجة 70٪ أو أكثر.",
  },
  five_lessons: {
    title: "مثابر",
    description: "أكملت خمسة دروس.",
  },
  week_streak: {
    title: "أسبوع من التعلّم",
    description: "حافظت على سلسلة تعلّم لمدة سبعة أيام.",
  },
  xp_500: {
    title: "جامع الخبرة",
    description: "وصلت إلى 500 نقطة خبرة.",
  },
};

function levelFor(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}

function jordanDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDayKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, "0"),
    String(shifted.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

async function getProfile(accountId: number) {
  const [row] = await db
    .select({
      id: studentAccountsTable.id,
      displayName: studentAccountsTable.displayName,
      gradeId: studentAccountsTable.gradeId,
      gradeTitle: gradesTable.title,
      totalXp: studentAccountsTable.totalXp,
      streakDays: studentAccountsTable.streakDays,
      role: studentAccountsTable.role,
      status: studentAccountsTable.status,
    })
    .from(studentAccountsTable)
    .leftJoin(gradesTable, eq(studentAccountsTable.gradeId, gradesTable.id))
    .where(eq(studentAccountsTable.id, accountId))
    .limit(1);
  if (!row) return null;
  return { ...row, level: levelFor(row.totalXp) };
}

router.get("/me", requireActiveStudent, async (req, res): Promise<void> => {
  const account = await getOrCreateStudentAccount(req);
  if (!account) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  const profile = await getProfile(account.id);
  if (!profile) {
    res.status(404).json({ error: "Student profile not found" });
    return;
  }
  res.json(GetMyProfileResponse.parse(profile));
});

router.patch("/me", requireActiveStudent, async (req, res): Promise<void> => {
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const account = await getOrCreateStudentAccount(req);
  if (!account) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  if (parsed.data.gradeId !== undefined && parsed.data.gradeId !== null) {
    const [grade] = await db
      .select({ id: gradesTable.id })
      .from(gradesTable)
      .where(eq(gradesTable.id, parsed.data.gradeId))
      .limit(1);
    if (!grade) {
      res.status(404).json({ error: "Grade not found" });
      return;
    }
  }

  const update: {
    displayName?: string;
    gradeId?: number | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (parsed.data.displayName !== undefined) {
    update.displayName = parsed.data.displayName.trim();
  }
  if (parsed.data.gradeId !== undefined) {
    update.gradeId = parsed.data.gradeId;
  }
  await db
    .update(studentAccountsTable)
    .set(update)
    .where(eq(studentAccountsTable.id, account.id));
  const profile = await getProfile(account.id);
  if (!profile) {
    res.status(404).json({ error: "Student profile not found" });
    return;
  }
  res.json(UpdateMyProfileResponse.parse(profile));
});

router.get(
  "/me/dashboard",
  requireActiveStudent,
  async (req, res): Promise<void> => {
    const account = await getOrCreateStudentAccount(req);
    if (!account) {
      res.status(401).json({ error: "Sign in required" });
      return;
    }
    const profile = await getProfile(account.id);
    if (!profile) {
      res.status(404).json({ error: "Student profile not found" });
      return;
    }
    const [lessonCount] = await db
      .select({ total: count() })
      .from(lessonsTable);
    const attemptsByLesson = await db
      .select({
        lessonId: quizAttemptsTable.lessonId,
        bestScore: sql<number>`max(${quizAttemptsTable.scorePercent})::int`,
        attempts: count(),
        lastAttemptAt: sql<Date>`max(${quizAttemptsTable.completedAt})`,
      })
      .from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.studentId, account.id))
      .groupBy(quizAttemptsTable.lessonId);
    const completedLessons = attemptsByLesson.filter(
      (item) => item.bestScore >= 70,
    ).length;
    const today = jordanDayKey();
    const todaysAttempts = await db
      .select({
        lessonId: quizAttemptsTable.lessonId,
        scorePercent: quizAttemptsTable.scorePercent,
        earnedXp: quizAttemptsTable.earnedXp,
      })
      .from(quizAttemptsTable)
      .where(
        and(
          eq(quizAttemptsTable.studentId, account.id),
          eq(quizAttemptsTable.dayKey, today),
        ),
      );
    const todayCompleted = new Set(
      todaysAttempts
        .filter((item) => item.scorePercent >= 70)
        .map((item) => item.lessonId),
    );

    const lessonFilter = account.gradeId
      ? eq(subjectsTable.gradeId, account.gradeId)
      : undefined;
    const availableLessons = await getLessonRows(account.id, lessonFilter);
    const notCompleted = availableLessons.filter((lesson) => !lesson.isCompleted);
    const continueLearning = notCompleted.slice(0, 3);
    const recentRows = await db
      .select({
        id: quizAttemptsTable.id,
        lessonTitle: lessonsTable.title,
        happenedAt: quizAttemptsTable.completedAt,
        xpEarned: quizAttemptsTable.earnedXp,
      })
      .from(quizAttemptsTable)
      .innerJoin(lessonsTable, eq(quizAttemptsTable.lessonId, lessonsTable.id))
      .where(eq(quizAttemptsTable.studentId, account.id))
      .orderBy(desc(quizAttemptsTable.completedAt))
      .limit(5);
    const achievementRows = await db
      .select({
        code: studentAchievementsTable.code,
        earnedAt: studentAchievementsTable.earnedAt,
      })
      .from(studentAchievementsTable)
      .where(eq(studentAchievementsTable.studentId, account.id))
      .orderBy(asc(studentAchievementsTable.earnedAt));

    res.json(
      GetMyDashboardResponse.parse({
        profile,
        totalLessons: lessonCount?.total ?? 0,
        completedLessons,
        dailyGoal: {
          completedLessons: todayCompleted.size,
          targetLessons: 1,
          xpEarned: todaysAttempts.reduce(
            (total, attempt) => total + attempt.earnedXp,
            0,
          ),
          targetXp: 50,
        },
        continueLearning,
        recentActivity: recentRows.map((row) => ({
          id: row.id,
          kind: "quiz",
          summary: `أكملت اختبار درس ${row.lessonTitle}`,
          happenedAt: row.happenedAt,
          xpEarned: row.xpEarned,
        })),
        achievements: achievementRows.flatMap((achievement) => {
          const details = achievementCatalog[achievement.code];
          return details
            ? [{ code: achievement.code, ...details, earnedAt: achievement.earnedAt }]
            : [];
        }),
        contentNotice:
          "تظهر حالة كل درس ومصدره بوضوح. المحتوى غير الموثق تجريبي وليس منهجًا أردنيًا معتمدًا.",
      }),
    );
  },
);

router.get(
  "/me/progress",
  requireActiveStudent,
  async (req, res): Promise<void> => {
    const account = await getOrCreateStudentAccount(req);
    if (!account) {
      res.status(401).json({ error: "Sign in required" });
      return;
    }
    const rows = await db
      .select({
        lessonId: lessonsTable.id,
        lessonTitle: lessonsTable.title,
        unitTitle: unitsTable.title,
        subjectTitle: subjectsTable.title,
        gradeNumber: gradesTable.gradeNumber,
        bestScore: sql<number>`max(${quizAttemptsTable.scorePercent})::int`,
        attempts: count(),
        lastAttemptAt: sql<Date>`max(${quizAttemptsTable.completedAt})`,
      })
      .from(quizAttemptsTable)
      .innerJoin(lessonsTable, eq(quizAttemptsTable.lessonId, lessonsTable.id))
      .innerJoin(unitsTable, eq(lessonsTable.unitId, unitsTable.id))
      .innerJoin(subjectsTable, eq(unitsTable.subjectId, subjectsTable.id))
      .innerJoin(gradesTable, eq(subjectsTable.gradeId, gradesTable.id))
      .where(eq(quizAttemptsTable.studentId, account.id))
      .groupBy(
        lessonsTable.id,
        unitsTable.id,
        subjectsTable.id,
        gradesTable.id,
      )
      .orderBy(desc(sql`max(${quizAttemptsTable.completedAt})`));
    res.json(
      GetMyProgressResponse.parse(
        rows.map((row) => ({
          ...row,
          isCompleted: row.bestScore >= 70,
        })),
      ),
    );
  },
);

router.post(
  "/quiz-attempts",
  requireActiveStudent,
  async (req, res): Promise<void> => {
    const parsed = SubmitQuizAttemptBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const account = await getOrCreateStudentAccount(req);
    if (!account) {
      res.status(401).json({ error: "Sign in required" });
      return;
    }
    const { lessonId, answers } = parsed.data;
    const uniqueQuestionIds = new Set(answers.map((answer) => answer.questionId));
    if (uniqueQuestionIds.size !== answers.length) {
      res.status(400).json({ error: "Each question must be answered once" });
      return;
    }

    const result = await db.transaction(async (tx) => {
      const [lockedAccount] = await tx
        .select()
        .from(studentAccountsTable)
        .where(eq(studentAccountsTable.id, account.id))
        .for("update");
      if (!lockedAccount || lockedAccount.status !== "active") {
        return { error: "Student account is unavailable", status: 403 as const };
      }
      const [lesson] = await tx
        .select({ id: lessonsTable.id })
        .from(lessonsTable)
        .where(eq(lessonsTable.id, lessonId))
        .limit(1);
      if (!lesson) {
        return { error: "Lesson not found", status: 404 as const };
      }
      const allQuestions = await tx
        .select()
        .from(questionsTable)
        .where(eq(questionsTable.lessonId, lessonId))
        .orderBy(asc(questionsTable.position), asc(questionsTable.id));
      const quizSize = Math.min(10, allQuestions.length);
      const answeredIds = new Set(answers.map((answer) => answer.questionId));
      const questions = allQuestions.filter((question) => answeredIds.has(question.id));
      if (answers.length !== quizSize) {
        return { error: "Answers must match this lesson's quiz", status: 400 as const };
      }
      if (questions.length === 0) {
        return { error: "This lesson does not have a quiz yet", status: 400 as const };
      }
      if (
        answers.length !== questions.length ||
        answers.some(
          (answer) =>
            !questions.some((question) => question.id === answer.questionId) ||
            answer.selectedOption >=
              (questions.find((question) => question.id === answer.questionId)
                ?.options.length ?? 0),
        )
      ) {
        return {
          error: "Answers must match this lesson's quiz",
          status: 400 as const,
        };
      }

      const answerMap = new Map(
        answers.map((answer) => [answer.questionId, answer.selectedOption]),
      );
      const answerResults = questions.map((question) => {
        const selectedOption = answerMap.get(question.id)!;
        return {
          questionId: question.id,
          prompt: question.prompt,
          selectedOption,
          correctOption: question.correctOption,
          isCorrect: selectedOption === question.correctOption,
          explanation: question.explanation,
        };
      });
      const correctAnswers = answerResults.filter((answer) => answer.isCorrect).length;
      const scorePercent = Math.round(
        (correctAnswers / questions.length) * 100,
      );
      const dayKey = jordanDayKey();
      const [previousCompletion] = await tx
        .select({ id: quizAttemptsTable.id })
        .from(quizAttemptsTable)
        .where(
          and(
            eq(quizAttemptsTable.studentId, account.id),
            eq(quizAttemptsTable.lessonId, lessonId),
            gte(quizAttemptsTable.scorePercent, 70),
          ),
        )
        .limit(1);
      const completedLessonsBefore = await tx
        .select({
          lessonId: quizAttemptsTable.lessonId,
          bestScore: sql<number>`max(${quizAttemptsTable.scorePercent})::int`,
        })
        .from(quizAttemptsTable)
        .where(eq(quizAttemptsTable.studentId, account.id))
        .groupBy(quizAttemptsTable.lessonId);
      const [{ best: previousBestCorrect }] = await tx
        .select({
          best: sql<number>`coalesce(max(${quizAttemptsTable.correctAnswers}), 0)::int`,
        })
        .from(quizAttemptsTable)
        .where(
          sql`${quizAttemptsTable.studentId} = ${account.id} and ${quizAttemptsTable.lessonId} = ${lessonId}`,
        );
      const earnedXp =
        Math.max(0, correctAnswers - previousBestCorrect) * 10 +
        (scorePercent >= 70 && !previousCompletion ? 20 : 0);
      const streakDays =
        lockedAccount.lastActiveDay === dayKey
          ? lockedAccount.streakDays
          : lockedAccount.lastActiveDay === shiftDayKey(dayKey, -1)
            ? lockedAccount.streakDays + 1
            : 1;

      const [attempt] = await tx
        .insert(quizAttemptsTable)
        .values({
          studentId: account.id,
          lessonId,
          totalQuestions: questions.length,
          correctAnswers,
          scorePercent,
          earnedXp,
          dayKey,
        })
        .returning();
      const [updatedAccount] = await tx
        .update(studentAccountsTable)
        .set({
          totalXp: lockedAccount.totalXp + earnedXp,
          streakDays,
          lastActiveDay: dayKey,
          updatedAt: new Date(),
        })
        .where(eq(studentAccountsTable.id, account.id))
        .returning();
      const completedCount =
        completedLessonsBefore.filter((item) => item.bestScore >= 70).length +
        (scorePercent >= 70 && !previousCompletion ? 1 : 0);
      const newlyEarnedCodes = ["first_quiz"];
      if (completedCount >= 1) newlyEarnedCodes.push("first_lesson");
      if (completedCount >= 5) newlyEarnedCodes.push("five_lessons");
      if (streakDays >= 7) newlyEarnedCodes.push("week_streak");
      if (updatedAccount.totalXp >= 500) newlyEarnedCodes.push("xp_500");
      await tx
        .insert(studentAchievementsTable)
        .values(
          newlyEarnedCodes.map((code) => ({
            studentId: account.id,
            code,
          })),
        )
        .onConflictDoNothing({
          target: [
            studentAchievementsTable.studentId,
            studentAchievementsTable.code,
          ],
        });
      return {
        attemptId: attempt.id,
        totalQuestions: questions.length,
        correctAnswers,
        scorePercent,
        earnedXp,
        totalXp: updatedAccount.totalXp,
        level: levelFor(updatedAccount.totalXp),
        streakDays: updatedAccount.streakDays,
        results: answerResults,
      };
    });
    if (result.status !== undefined) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json(SubmitQuizAttemptResponse.parse(result));
  },
);

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      displayName: studentAccountsTable.displayName,
      gradeTitle: gradesTable.title,
      totalXp: studentAccountsTable.totalXp,
    })
    .from(studentAccountsTable)
    .leftJoin(gradesTable, eq(studentAccountsTable.gradeId, gradesTable.id))
    .where(
      and(
        eq(studentAccountsTable.status, "active"),
        eq(studentAccountsTable.role, "student"),
      ),
    )
    .orderBy(
      desc(studentAccountsTable.totalXp),
      asc(studentAccountsTable.displayName),
    )
    .limit(20);
  res.json(
    GetLeaderboardResponse.parse(
      rows.map((row, index) => ({
        rank: index + 1,
        displayName: row.displayName,
        gradeTitle: row.gradeTitle,
        totalXp: row.totalXp,
        level: levelFor(row.totalXp),
      })),
    ),
  );
});

export default router;

import { getAuth } from "@clerk/express";
import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { Request } from "express";
import {
  db,
  gradesTable,
  lessonsTable,
  questionsTable,
  quizAttemptsTable,
  studentAccountsTable,
  subjectsTable,
  unitsTable,
} from "@workspace/db";

export async function currentStudentId(req: Request): Promise<number | null> {
  const clerkUserId = getAuth(req).userId;
  if (!clerkUserId) return null;
  const [account] = await db
    .select({ id: studentAccountsTable.id })
    .from(studentAccountsTable)
    .where(eq(studentAccountsTable.clerkUserId, clerkUserId))
    .limit(1);
  return account?.id ?? null;
}

export async function getLessonRows(
  studentId: number | null,
  whereClause?: SQL,
) {
  const questionCounts = db
    .select({
      lessonId: questionsTable.lessonId,
      total: sql<number>`count(*)::int`.as("total"),
    })
    .from(questionsTable)
    .groupBy(questionsTable.lessonId)
    .as("question_counts");

  const joinedQuery = db
    .select({
      id: lessonsTable.id,
      unitId: lessonsTable.unitId,
      title: lessonsTable.title,
      description: lessonsTable.description,
      objective: lessonsTable.objective,
      explanation: lessonsTable.explanation,
      objectives: lessonsTable.objectives,
      durationMinutes: lessonsTable.durationMinutes,
      contentStatus: lessonsTable.contentStatus,
      sourceReference: lessonsTable.sourceReference,
      unitTitle: unitsTable.title,
      subjectTitle: subjectsTable.title,
      gradeNumber: gradesTable.gradeNumber,
      questionCount: sql<number>`coalesce(${questionCounts.total}, 0)::int`,
    })
    .from(lessonsTable)
    .innerJoin(unitsTable, eq(lessonsTable.unitId, unitsTable.id))
    .innerJoin(subjectsTable, eq(unitsTable.subjectId, subjectsTable.id))
    .innerJoin(gradesTable, eq(subjectsTable.gradeId, gradesTable.id))
    .leftJoin(questionCounts, eq(questionCounts.lessonId, lessonsTable.id));

  const rows = whereClause
    ? await joinedQuery
        .where(whereClause)
        .orderBy(lessonsTable.title)
    : await joinedQuery.orderBy(lessonsTable.title);

  const bestScores = new Map<number, number>();
  if (studentId !== null && rows.length > 0) {
    const attempts = await db
      .select({
        lessonId: quizAttemptsTable.lessonId,
        scorePercent: quizAttemptsTable.scorePercent,
      })
      .from(quizAttemptsTable)
      .where(
        and(
          eq(quizAttemptsTable.studentId, studentId),
          inArray(
            quizAttemptsTable.lessonId,
            rows.map((row) => row.id),
          ),
        ),
      );
    for (const attempt of attempts) {
      bestScores.set(
        attempt.lessonId,
        Math.max(bestScores.get(attempt.lessonId) ?? 0, attempt.scorePercent),
      );
    }
  }

  return rows.map((row) => {
    const bestScore = bestScores.get(row.id) ?? null;
    return {
      ...row,
      isCompleted: bestScore !== null && bestScore >= 70,
      bestScore,
    };
  });
}

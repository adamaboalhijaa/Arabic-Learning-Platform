import { getAuth } from "@clerk/express";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  ListAdminStudentsResponse,
  UpdateAdminStudentBody,
  UpdateAdminStudentParams,
  UpdateAdminStudentResponse,
} from "@workspace/api-zod";
import {
  db,
  gradesTable,
  quizAttemptsTable,
  studentAccountsTable,
} from "@workspace/db";
import { requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();
router.use(requireAdmin);

async function getAdminStudent(id: number) {
  const [row] = await db
    .select({
      id: studentAccountsTable.id,
      displayName: studentAccountsTable.displayName,
      gradeId: studentAccountsTable.gradeId,
      gradeTitle: gradesTable.title,
      totalXp: studentAccountsTable.totalXp,
      role: studentAccountsTable.role,
      status: studentAccountsTable.status,
      lessonsCompleted: sql<number>`(
        select count(distinct ${quizAttemptsTable.lessonId})::int
        from ${quizAttemptsTable}
        where ${quizAttemptsTable.studentId} = ${studentAccountsTable.id}
          and ${quizAttemptsTable.scorePercent} >= 70
      )`,
    })
    .from(studentAccountsTable)
    .leftJoin(gradesTable, eq(studentAccountsTable.gradeId, gradesTable.id))
    .where(eq(studentAccountsTable.id, id))
    .limit(1);
  if (!row) return null;
  return { ...row, level: Math.floor(row.totalXp / 100) + 1 };
}

router.get("/", async (_req, res): Promise<void> => {
  const groupedAttempts = await db
    .select({
      studentId: quizAttemptsTable.studentId,
      lessonId: quizAttemptsTable.lessonId,
      bestScore: sql<number>`max(${quizAttemptsTable.scorePercent})::int`,
    })
    .from(quizAttemptsTable)
    .groupBy(quizAttemptsTable.studentId, quizAttemptsTable.lessonId);
  const completedCount = new Map<number, number>();
  for (const attempt of groupedAttempts) {
    if (attempt.bestScore >= 70) {
      completedCount.set(
        attempt.studentId,
        (completedCount.get(attempt.studentId) ?? 0) + 1,
      );
    }
  }
  const rows = await db
    .select({
      id: studentAccountsTable.id,
      displayName: studentAccountsTable.displayName,
      gradeId: studentAccountsTable.gradeId,
      gradeTitle: gradesTable.title,
      totalXp: studentAccountsTable.totalXp,
      role: studentAccountsTable.role,
      status: studentAccountsTable.status,
    })
    .from(studentAccountsTable)
    .leftJoin(gradesTable, eq(studentAccountsTable.gradeId, gradesTable.id))
    .orderBy(desc(studentAccountsTable.createdAt));
  res.json(
    ListAdminStudentsResponse.parse(
      rows.map((row) => ({
        ...row,
        level: Math.floor(row.totalXp / 100) + 1,
        lessonsCompleted: completedCount.get(row.id) ?? 0,
      })),
    ),
  );
});

router.patch("/:studentId", async (req, res): Promise<void> => {
  const params = UpdateAdminStudentParams.safeParse(req.params);
  const parsed = UpdateAdminStudentBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "No student fields were provided" });
    return;
  }
  const [target] = await db
    .select()
    .from(studentAccountsTable)
    .where(eq(studentAccountsTable.id, params.data.studentId))
    .limit(1);
  if (!target) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  if (parsed.data.gradeId !== undefined && parsed.data.gradeId !== null) {
    const [grade] = await db
      .select({ id: gradesTable.id })
      .from(gradesTable)
      .where(eq(gradesTable.id, parsed.data.gradeId))
      .limit(1);
    if (!grade) {
      res.status(400).json({ error: "Grade not found" });
      return;
    }
  }

  const clerkUserId = getAuth(req).userId;
  const [currentAdmin] = clerkUserId
    ? await db
        .select({ id: studentAccountsTable.id })
        .from(studentAccountsTable)
        .where(eq(studentAccountsTable.clerkUserId, clerkUserId))
        .limit(1)
    : [];
  const removesLastAdmin =
    target.role === "admin" &&
    target.status === "active" &&
    ((parsed.data.role === "student") || parsed.data.status === "disabled");
  if (removesLastAdmin) {
    if (target.id === currentAdmin?.id) {
      res.status(400).json({ error: "You cannot disable or demote your own admin account" });
      return;
    }
    const [adminCount] = await db
      .select({ total: count() })
      .from(studentAccountsTable)
      .where(
        and(
          eq(studentAccountsTable.role, "admin"),
          eq(studentAccountsTable.status, "active"),
        ),
      );
    if ((adminCount?.total ?? 0) <= 1) {
      res.status(400).json({ error: "Keep at least one active admin account" });
      return;
    }
  }

  await db
    .update(studentAccountsTable)
    .set(parsed.data)
    .where(eq(studentAccountsTable.id, target.id));
  const updated = await getAdminStudent(target.id);
  if (!updated) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(UpdateAdminStudentResponse.parse(updated));
});

export default router;

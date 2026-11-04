import { and, asc, count, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateGradeBody,
  CreateGradeResponse,
  CreateLessonBody,
  CreateLessonResponse,
  CreateSubjectBody,
  CreateSubjectResponse,
  CreateUnitBody,
  CreateUnitResponse,
  DeleteGradeParams,
  DeleteLessonParams,
  DeleteSubjectParams,
  DeleteUnitParams,
  GetAdminOverviewResponse,
  ListAdminGradesResponse,
  ListAdminLessonsQueryParams,
  ListAdminLessonsResponse,
  ListAdminSubjectsQueryParams,
  ListAdminSubjectsResponse,
  ListAdminUnitsQueryParams,
  ListAdminUnitsResponse,
  UpdateGradeBody,
  UpdateGradeParams,
  UpdateGradeResponse,
  UpdateLessonBody,
  UpdateLessonParams,
  UpdateLessonResponse,
  UpdateSubjectBody,
  UpdateSubjectParams,
  UpdateSubjectResponse,
  UpdateUnitBody,
  UpdateUnitParams,
  UpdateUnitResponse,
} from "@workspace/api-zod";
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
import { requireAdmin } from "../../middlewares/auth";
import { getLessonRows } from "../../lib/lessonQueries";

const router: IRouter = Router();
router.use(requireAdmin);

async function gradeDto(id: number) {
  const [row] = await db
    .select({
      id: gradesTable.id,
      gradeNumber: gradesTable.gradeNumber,
      title: gradesTable.title,
      stage: gradesTable.stage,
      contentStatus: gradesTable.contentStatus,
      subjectCount: db.$count(subjectsTable, eq(subjectsTable.gradeId, id)),
    })
    .from(gradesTable)
    .where(eq(gradesTable.id, id))
    .limit(1);
  return row;
}

async function subjectDto(id: number) {
  const [row] = await db
    .select({
      id: subjectsTable.id,
      gradeId: subjectsTable.gradeId,
      title: subjectsTable.title,
      description: subjectsTable.description,
      unitCount: db.$count(unitsTable, eq(unitsTable.subjectId, id)),
    })
    .from(subjectsTable)
    .where(eq(subjectsTable.id, id))
    .limit(1);
  return row;
}

async function unitDto(id: number) {
  const [row] = await db
    .select({
      id: unitsTable.id,
      subjectId: unitsTable.subjectId,
      title: unitsTable.title,
      position: unitsTable.position,
      contentStatus: unitsTable.contentStatus,
      lessonCount: db.$count(lessonsTable, eq(lessonsTable.unitId, id)),
    })
    .from(unitsTable)
    .where(eq(unitsTable.id, id))
    .limit(1);
  return row;
}

async function lessonDto(id: number) {
  const [lesson] = await getLessonRows(
    null,
    eq(lessonsTable.id, id),
  );
  return lesson;
}

router.get("/overview", async (_req, res): Promise<void> => {
  const [
    studentRows,
    gradeRows,
    subjectRows,
    unitRows,
    lessonRows,
    questionRows,
    draftRows,
    verifiedRows,
  ] = await Promise.all([
    db.select({ total: count() }).from(studentAccountsTable),
    db.select({ total: count() }).from(gradesTable),
    db.select({ total: count() }).from(subjectsTable),
    db.select({ total: count() }).from(unitsTable),
    db.select({ total: count() }).from(lessonsTable),
    db.select({ total: count() }).from(questionsTable),
    db
      .select({ total: count() })
      .from(lessonsTable)
      .where(eq(lessonsTable.contentStatus, "draft")),
    db
      .select({ total: count() })
      .from(lessonsTable)
      .where(eq(lessonsTable.contentStatus, "verified")),
  ]);
  res.json(
    GetAdminOverviewResponse.parse({
      studentCount: studentRows[0]?.total ?? 0,
      gradeCount: gradeRows[0]?.total ?? 0,
      subjectCount: subjectRows[0]?.total ?? 0,
      unitCount: unitRows[0]?.total ?? 0,
      lessonCount: lessonRows[0]?.total ?? 0,
      questionCount: questionRows[0]?.total ?? 0,
      draftLessonCount: draftRows[0]?.total ?? 0,
      verifiedLessonCount: verifiedRows[0]?.total ?? 0,
    }),
  );
});

router.get("/grades", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: gradesTable.id,
      gradeNumber: gradesTable.gradeNumber,
      title: gradesTable.title,
      stage: gradesTable.stage,
      contentStatus: gradesTable.contentStatus,
      subjectCount: db.$count(
        subjectsTable,
        eq(subjectsTable.gradeId, gradesTable.id),
      ),
    })
    .from(gradesTable)
    .orderBy(asc(gradesTable.gradeNumber));
  res.json(ListAdminGradesResponse.parse(rows));
});

router.post("/grades", async (req, res): Promise<void> => {
  const parsed = CreateGradeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [duplicate] = await db
    .select({ id: gradesTable.id })
    .from(gradesTable)
    .where(eq(gradesTable.gradeNumber, parsed.data.gradeNumber))
    .limit(1);
  if (duplicate) {
    res.status(409).json({ error: "Grade number already exists" });
    return;
  }
  const [created] = await db
    .insert(gradesTable)
    .values(parsed.data)
    .returning({ id: gradesTable.id });
  const grade = await gradeDto(created.id);
  res.status(201).json(CreateGradeResponse.parse(grade));
});

router.patch("/grades/:gradeId", async (req, res): Promise<void> => {
  const params = UpdateGradeParams.safeParse(req.params);
  const parsed = UpdateGradeBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.gradeNumber !== undefined) {
    const [duplicate] = await db
      .select({ id: gradesTable.id })
      .from(gradesTable)
      .where(eq(gradesTable.gradeNumber, parsed.data.gradeNumber))
      .limit(1);
    if (duplicate && duplicate.id !== params.data.gradeId) {
      res.status(409).json({ error: "Grade number already exists" });
      return;
    }
  }
  const [updated] = await db
    .update(gradesTable)
    .set(parsed.data)
    .where(eq(gradesTable.id, params.data.gradeId))
    .returning({ id: gradesTable.id });
  if (!updated) {
    res.status(404).json({ error: "Grade not found" });
    return;
  }
  res.json(UpdateGradeResponse.parse(await gradeDto(updated.id)));
});

router.delete("/grades/:gradeId", async (req, res): Promise<void> => {
  const params = DeleteGradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [grade] = await db
    .select({ id: gradesTable.id })
    .from(gradesTable)
    .where(eq(gradesTable.id, params.data.gradeId))
    .limit(1);
  if (!grade) {
    res.status(404).json({ error: "Grade not found" });
    return;
  }
  const [subject] = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(eq(subjectsTable.gradeId, grade.id))
    .limit(1);
  if (subject) {
    res.status(400).json({ error: "Remove the grade's subjects first" });
    return;
  }
  await db.delete(gradesTable).where(eq(gradesTable.id, grade.id));
  res.sendStatus(204);
});

router.get("/subjects", async (req, res): Promise<void> => {
  const parsed = ListAdminSubjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const subjectCountByUnit = db
    .select({
      subjectId: unitsTable.subjectId,
      total: count().as("total"),
    })
    .from(unitsTable)
    .groupBy(unitsTable.subjectId)
    .as("unit_counts");
  const query = db
    .select({
      id: subjectsTable.id,
      gradeId: subjectsTable.gradeId,
      title: subjectsTable.title,
      description: subjectsTable.description,
      unitCount: sql<number>`coalesce(${subjectCountByUnit.total}, 0)::int`,
    })
    .from(subjectsTable)
    .leftJoin(
      subjectCountByUnit,
      eq(subjectCountByUnit.subjectId, subjectsTable.id),
    );
  const rows =
    parsed.data.gradeId === undefined
      ? await query.orderBy(asc(subjectsTable.title))
      : await query
          .where(eq(subjectsTable.gradeId, parsed.data.gradeId))
          .orderBy(asc(subjectsTable.title));
  res.json(ListAdminSubjectsResponse.parse(rows));
});

router.post("/subjects", async (req, res): Promise<void> => {
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [grade] = await db
    .select({ id: gradesTable.id })
    .from(gradesTable)
    .where(eq(gradesTable.id, parsed.data.gradeId))
    .limit(1);
  if (!grade) {
    res.status(400).json({ error: "Grade not found" });
    return;
  }
  const [duplicate] = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(
      and(
        eq(subjectsTable.gradeId, parsed.data.gradeId),
        eq(subjectsTable.title, parsed.data.title),
      ),
    )
    .limit(1);
  if (duplicate) {
    res.status(409).json({ error: "Subject already exists in this grade" });
    return;
  }
  const [created] = await db
    .insert(subjectsTable)
    .values(parsed.data)
    .returning({ id: subjectsTable.id });
  res.status(201).json(
    CreateSubjectResponse.parse(await subjectDto(created.id)),
  );
});

router.patch("/subjects/:subjectId", async (req, res): Promise<void> => {
  const params = UpdateSubjectParams.safeParse(req.params);
  const parsed = UpdateSubjectBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [current] = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, params.data.subjectId))
    .limit(1);
  if (!current) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  const gradeId = parsed.data.gradeId ?? current.gradeId;
  if (parsed.data.gradeId !== undefined) {
    const [grade] = await db
      .select({ id: gradesTable.id })
      .from(gradesTable)
      .where(eq(gradesTable.id, gradeId))
      .limit(1);
    if (!grade) {
      res.status(400).json({ error: "Grade not found" });
      return;
    }
  }
  const title = parsed.data.title ?? current.title;
  const [duplicate] = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(
      and(
        eq(subjectsTable.gradeId, gradeId),
        eq(subjectsTable.title, title),
      ),
    )
    .limit(1);
  if (duplicate && duplicate.id !== current.id) {
    res.status(409).json({ error: "Subject already exists in this grade" });
    return;
  }
  await db
    .update(subjectsTable)
    .set(parsed.data)
    .where(eq(subjectsTable.id, current.id));
  res.json(UpdateSubjectResponse.parse(await subjectDto(current.id)));
});

router.delete("/subjects/:subjectId", async (req, res): Promise<void> => {
  const params = DeleteSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [subject] = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(eq(subjectsTable.id, params.data.subjectId))
    .limit(1);
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  const [unit] = await db
    .select({ id: unitsTable.id })
    .from(unitsTable)
    .where(eq(unitsTable.subjectId, subject.id))
    .limit(1);
  if (unit) {
    res.status(400).json({ error: "Remove the subject's units first" });
    return;
  }
  await db.delete(subjectsTable).where(eq(subjectsTable.id, subject.id));
  res.sendStatus(204);
});

router.get("/units", async (req, res): Promise<void> => {
  const parsed = ListAdminUnitsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const lessonCounts = db
    .select({
      unitId: lessonsTable.unitId,
      total: count().as("total"),
    })
    .from(lessonsTable)
    .groupBy(lessonsTable.unitId)
    .as("lesson_counts");
  const query = db
    .select({
      id: unitsTable.id,
      subjectId: unitsTable.subjectId,
      title: unitsTable.title,
      position: unitsTable.position,
      contentStatus: unitsTable.contentStatus,
      lessonCount: sql<number>`coalesce(${lessonCounts.total}, 0)::int`,
    })
    .from(unitsTable)
    .leftJoin(lessonCounts, eq(lessonCounts.unitId, unitsTable.id));
  const rows =
    parsed.data.subjectId === undefined
      ? await query.orderBy(asc(unitsTable.position), asc(unitsTable.title))
      : await query
          .where(eq(unitsTable.subjectId, parsed.data.subjectId))
          .orderBy(asc(unitsTable.position), asc(unitsTable.title));
  res.json(ListAdminUnitsResponse.parse(rows));
});

router.post("/units", async (req, res): Promise<void> => {
  const parsed = CreateUnitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [subject] = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(eq(subjectsTable.id, parsed.data.subjectId))
    .limit(1);
  if (!subject) {
    res.status(400).json({ error: "Subject not found" });
    return;
  }
  const [duplicate] = await db
    .select({ id: unitsTable.id })
    .from(unitsTable)
    .where(
      and(
        eq(unitsTable.subjectId, parsed.data.subjectId),
        eq(unitsTable.title, parsed.data.title),
      ),
    )
    .limit(1);
  if (duplicate) {
    res.status(409).json({ error: "Unit already exists in this subject" });
    return;
  }
  const [created] = await db
    .insert(unitsTable)
    .values(parsed.data)
    .returning({ id: unitsTable.id });
  res.status(201).json(CreateUnitResponse.parse(await unitDto(created.id)));
});

router.patch("/units/:unitId", async (req, res): Promise<void> => {
  const params = UpdateUnitParams.safeParse(req.params);
  const parsed = UpdateUnitBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [current] = await db
    .select()
    .from(unitsTable)
    .where(eq(unitsTable.id, params.data.unitId))
    .limit(1);
  if (!current) {
    res.status(404).json({ error: "Unit not found" });
    return;
  }
  const subjectId = parsed.data.subjectId ?? current.subjectId;
  if (parsed.data.subjectId !== undefined) {
    const [subject] = await db
      .select({ id: subjectsTable.id })
      .from(subjectsTable)
      .where(eq(subjectsTable.id, subjectId))
      .limit(1);
    if (!subject) {
      res.status(400).json({ error: "Subject not found" });
      return;
    }
  }
  const title = parsed.data.title ?? current.title;
  const [duplicate] = await db
    .select({ id: unitsTable.id })
    .from(unitsTable)
    .where(
      and(
        eq(unitsTable.subjectId, subjectId),
        eq(unitsTable.title, title),
      ),
    )
    .limit(1);
  if (duplicate && duplicate.id !== current.id) {
    res.status(409).json({ error: "Unit already exists in this subject" });
    return;
  }
  await db.update(unitsTable).set(parsed.data).where(eq(unitsTable.id, current.id));
  res.json(UpdateUnitResponse.parse(await unitDto(current.id)));
});

router.delete("/units/:unitId", async (req, res): Promise<void> => {
  const params = DeleteUnitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [unit] = await db
    .select({ id: unitsTable.id })
    .from(unitsTable)
    .where(eq(unitsTable.id, params.data.unitId))
    .limit(1);
  if (!unit) {
    res.status(404).json({ error: "Unit not found" });
    return;
  }
  const [lesson] = await db
    .select({ id: lessonsTable.id })
    .from(lessonsTable)
    .where(eq(lessonsTable.unitId, unit.id))
    .limit(1);
  if (lesson) {
    res.status(400).json({ error: "Remove the unit's lessons first" });
    return;
  }
  await db.delete(unitsTable).where(eq(unitsTable.id, unit.id));
  res.sendStatus(204);
});

router.get("/lessons", async (req, res): Promise<void> => {
  const parsed = ListAdminLessonsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows = await getLessonRows(
    null,
    parsed.data.unitId === undefined
      ? undefined
      : eq(lessonsTable.unitId, parsed.data.unitId),
  );
  res.json(ListAdminLessonsResponse.parse(rows));
});

router.post("/lessons", async (req, res): Promise<void> => {
  const parsed = CreateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [unit] = await db
    .select({ id: unitsTable.id })
    .from(unitsTable)
    .where(eq(unitsTable.id, parsed.data.unitId))
    .limit(1);
  if (!unit) {
    res.status(400).json({ error: "Unit not found" });
    return;
  }
  if (parsed.data.contentStatus === "verified") {
    res.status(400).json({
      error:
        "Create the lesson as a draft, add sourced verified questions, then verify it.",
    });
    return;
  }
  const [created] = await db
    .insert(lessonsTable)
    .values(parsed.data)
    .returning({ id: lessonsTable.id });
  res.status(201).json(CreateLessonResponse.parse(await lessonDto(created.id)));
});

router.patch("/lessons/:lessonId", async (req, res): Promise<void> => {
  const params = UpdateLessonParams.safeParse(req.params);
  const parsed = UpdateLessonBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db
    .select({
      id: lessonsTable.id,
      contentStatus: lessonsTable.contentStatus,
      sourceReference: lessonsTable.sourceReference,
    })
    .from(lessonsTable)
    .where(eq(lessonsTable.id, params.data.lessonId))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  const finalStatus = parsed.data.contentStatus ?? existing.contentStatus;
  const finalSource =
    parsed.data.sourceReference !== undefined
      ? parsed.data.sourceReference
      : existing.sourceReference;
  const hasContentEdits = Object.keys(parsed.data).some(
    (key) => key !== "contentStatus",
  );
  if (
    existing.contentStatus === "verified" &&
    finalStatus === "verified" &&
    hasContentEdits
  ) {
    res.status(400).json({
      error: "Move the lesson back to draft before editing verified content.",
    });
    return;
  }
  if (finalStatus === "verified") {
    if (!finalSource?.trim()) {
      res.status(400).json({
        error: "A source reference is required before verifying this lesson.",
      });
      return;
    }
    const questions = await db
      .select({
        contentStatus: questionsTable.contentStatus,
        sourceReference: questionsTable.sourceReference,
      })
      .from(questionsTable)
      .where(eq(questionsTable.lessonId, existing.id));
    if (
      questions.length === 0 ||
      questions.some(
        (question) =>
          question.contentStatus !== "verified" ||
          !question.sourceReference?.trim(),
      )
    ) {
      res.status(400).json({
        error:
          "Verify every question and add its source before verifying the lesson.",
      });
      return;
    }
  }
  if (parsed.data.unitId !== undefined) {
    const [unit] = await db
      .select({ id: unitsTable.id })
      .from(unitsTable)
      .where(eq(unitsTable.id, parsed.data.unitId))
      .limit(1);
    if (!unit) {
      res.status(400).json({ error: "Unit not found" });
      return;
    }
  }
  await db
    .update(lessonsTable)
    .set(parsed.data)
    .where(eq(lessonsTable.id, existing.id));
  res.json(
    UpdateLessonResponse.parse(await lessonDto(existing.id)),
  );
});

router.delete("/lessons/:lessonId", async (req, res): Promise<void> => {
  const params = DeleteLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [lesson] = await db
    .select({ id: lessonsTable.id })
    .from(lessonsTable)
    .where(eq(lessonsTable.id, params.data.lessonId))
    .limit(1);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  const [attempt] = await db
    .select({ id: quizAttemptsTable.id })
    .from(quizAttemptsTable)
    .where(eq(quizAttemptsTable.lessonId, lesson.id))
    .limit(1);
  if (attempt) {
    res.status(400).json({
      error: "This lesson has student history and cannot be deleted",
    });
    return;
  }
  await db.delete(lessonsTable).where(eq(lessonsTable.id, lesson.id));
  res.sendStatus(204);
});

export default router;

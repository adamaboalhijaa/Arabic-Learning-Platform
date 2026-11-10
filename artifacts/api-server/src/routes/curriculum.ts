import { asc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetLessonParams,
  GetLessonQuizParams,
  GetLessonQuizResponse,
  GetLessonResponse,
  ListGradeSubjectsParams,
  ListGradeSubjectsResponse,
  ListGradesResponse,
  ListSubjectUnitsParams,
  ListSubjectUnitsResponse,
  ListUnitLessonsParams,
  ListUnitLessonsResponse,
} from "@workspace/api-zod";
import {
  db,
  gradesTable,
  lessonsTable,
  questionsTable,
  subjectsTable,
  unitsTable,
} from "@workspace/db";
import {
  currentStudentId,
  getLessonRows,
} from "../lib/lessonQueries";

const router: IRouter = Router();

router.get("/curriculum/grades", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: gradesTable.id,
      gradeNumber: gradesTable.gradeNumber,
      title: gradesTable.title,
      stage: gradesTable.stage,
      contentStatus: gradesTable.contentStatus,
      subjectCount: sql<number>`count(${subjectsTable.id})::int`,
    })
    .from(gradesTable)
    .leftJoin(subjectsTable, eq(subjectsTable.gradeId, gradesTable.id))
    .groupBy(gradesTable.id)
    .orderBy(asc(gradesTable.gradeNumber));
  res.json(ListGradesResponse.parse(rows));
});

router.get(
  "/curriculum/grades/:gradeId/subjects",
  async (req, res): Promise<void> => {
    const params = ListGradeSubjectsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const rows = await db
      .select({
        id: subjectsTable.id,
        gradeId: subjectsTable.gradeId,
        title: subjectsTable.title,
        description: subjectsTable.description,
        unitCount: sql<number>`count(${unitsTable.id})::int`,
      })
      .from(subjectsTable)
      .leftJoin(unitsTable, eq(unitsTable.subjectId, subjectsTable.id))
      .where(eq(subjectsTable.gradeId, params.data.gradeId))
      .groupBy(subjectsTable.id)
      .orderBy(asc(subjectsTable.title));
    res.json(ListGradeSubjectsResponse.parse(rows));
  },
);

router.get(
  "/curriculum/subjects/:subjectId/units",
  async (req, res): Promise<void> => {
    const params = ListSubjectUnitsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const rows = await db
      .select({
        id: unitsTable.id,
        subjectId: unitsTable.subjectId,
        title: unitsTable.title,
        position: unitsTable.position,
        contentStatus: unitsTable.contentStatus,
        lessonCount: sql<number>`count(${lessonsTable.id})::int`,
      })
      .from(unitsTable)
      .leftJoin(lessonsTable, eq(lessonsTable.unitId, unitsTable.id))
      .where(eq(unitsTable.subjectId, params.data.subjectId))
      .groupBy(unitsTable.id)
      .orderBy(asc(unitsTable.position), asc(unitsTable.title));
    res.json(ListSubjectUnitsResponse.parse(rows));
  },
);

router.get(
  "/curriculum/units/:unitId/lessons",
  async (req, res): Promise<void> => {
    const params = ListUnitLessonsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const studentId = await currentStudentId(req);
    const rows = await getLessonRows(
      studentId,
      eq(lessonsTable.unitId, params.data.unitId),
    );
    res.json(ListUnitLessonsResponse.parse(rows));
  },
);

router.get("/lessons/:lessonId", async (req, res): Promise<void> => {
  const params = GetLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const studentId = await currentStudentId(req);
  const [lesson] = await getLessonRows(
    studentId,
    eq(lessonsTable.id, params.data.lessonId),
  );
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(GetLessonResponse.parse(lesson));
});

router.get(
  "/lessons/:lessonId/quiz",
  async (req, res): Promise<void> => {
    const params = GetLessonQuizParams.safeParse(req.params);
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
    const questions = await db
      .select({
        id: questionsTable.id,
        prompt: questionsTable.prompt,
        kind: questionsTable.kind,
        options: questionsTable.options,
        position: questionsTable.position,
      })
      .from(questionsTable)
      .where(eq(questionsTable.lessonId, params.data.lessonId))
      .orderBy(sql`random()`)
      .limit(10);
    res.json(GetLessonQuizResponse.parse(questions));
  },
);

export default router;

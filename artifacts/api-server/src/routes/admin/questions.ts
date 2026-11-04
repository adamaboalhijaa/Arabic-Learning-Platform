import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateQuestionBody,
  CreateQuestionResponse,
  DeleteQuestionParams,
  ListAdminQuestionsQueryParams,
  ListAdminQuestionsResponse,
  UpdateQuestionBody,
  UpdateQuestionParams,
  UpdateQuestionResponse,
} from "@workspace/api-zod";
import { db, lessonsTable, questionsTable } from "@workspace/db";
import { requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();
router.use(requireAdmin);

function validateQuestionShape(input: {
  kind: string;
  options: string[];
  correctOption: number;
}): string | null {
  if (input.options.length < 2) {
    return "A question needs at least two answer options";
  }
  if (input.kind === "true_false" && input.options.length !== 2) {
    return "True-or-false questions need exactly two options";
  }
  if (
    !Number.isInteger(input.correctOption) ||
    input.correctOption < 0 ||
    input.correctOption >= input.options.length
  ) {
    return "Choose a correct answer from the listed options";
  }
  return null;
}

router.get("/", async (req, res): Promise<void> => {
  const parsed = ListAdminQuestionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows = await db
    .select({
      id: questionsTable.id,
      lessonId: questionsTable.lessonId,
      prompt: questionsTable.prompt,
      kind: questionsTable.kind,
      options: questionsTable.options,
      correctOption: questionsTable.correctOption,
      explanation: questionsTable.explanation,
      position: questionsTable.position,
      contentStatus: questionsTable.contentStatus,
      sourceReference: questionsTable.sourceReference,
    })
    .from(questionsTable)
    .where(eq(questionsTable.lessonId, parsed.data.lessonId))
    .orderBy(asc(questionsTable.position), asc(questionsTable.id));
  res.json(ListAdminQuestionsResponse.parse(rows));
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const shapeError = validateQuestionShape(parsed.data);
  if (shapeError) {
    res.status(400).json({ error: shapeError });
    return;
  }
  const [lesson] = await db
    .select({
      id: lessonsTable.id,
      contentStatus: lessonsTable.contentStatus,
    })
    .from(lessonsTable)
    .where(eq(lessonsTable.id, parsed.data.lessonId))
    .limit(1);
  if (!lesson) {
    res.status(400).json({ error: "Lesson not found" });
    return;
  }
  if (lesson.contentStatus === "verified") {
    res.status(400).json({
      error: "Move the lesson back to draft before editing its questions.",
    });
    return;
  }
  if (
    parsed.data.contentStatus === "verified" &&
    !parsed.data.sourceReference?.trim()
  ) {
    res.status(400).json({
      error: "A source reference is required before verifying this question.",
    });
    return;
  }
  const [created] = await db
    .insert(questionsTable)
    .values(parsed.data)
    .returning({
      id: questionsTable.id,
      lessonId: questionsTable.lessonId,
      prompt: questionsTable.prompt,
      kind: questionsTable.kind,
      options: questionsTable.options,
      correctOption: questionsTable.correctOption,
      explanation: questionsTable.explanation,
      position: questionsTable.position,
      contentStatus: questionsTable.contentStatus,
      sourceReference: questionsTable.sourceReference,
    });
  res.status(201).json(CreateQuestionResponse.parse(created));
});

router.patch("/:questionId", async (req, res): Promise<void> => {
  const params = UpdateQuestionParams.safeParse(req.params);
  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "No question fields were provided" });
    return;
  }
  const [current] = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.id, params.data.questionId))
    .limit(1);
  if (!current) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  const targetLessonId = parsed.data.lessonId ?? current.lessonId;
  const [originalLesson] = await db
    .select({
      id: lessonsTable.id,
      contentStatus: lessonsTable.contentStatus,
    })
    .from(lessonsTable)
    .where(eq(lessonsTable.id, current.lessonId))
    .limit(1);
  const [targetLesson] =
    targetLessonId === current.lessonId
      ? [originalLesson]
      : await db
          .select({
            id: lessonsTable.id,
            contentStatus: lessonsTable.contentStatus,
          })
          .from(lessonsTable)
          .where(eq(lessonsTable.id, targetLessonId))
          .limit(1);
  if (!targetLesson) {
    res.status(400).json({ error: "Lesson not found" });
    return;
  }
  if (
    originalLesson?.contentStatus === "verified" ||
    targetLesson.contentStatus === "verified"
  ) {
    res.status(400).json({
      error: "Move the lesson back to draft before editing its questions.",
    });
    return;
  }
  const shapeError = validateQuestionShape({
    kind: parsed.data.kind ?? current.kind,
    options: parsed.data.options ?? current.options,
    correctOption: parsed.data.correctOption ?? current.correctOption,
  });
  if (shapeError) {
    res.status(400).json({ error: shapeError });
    return;
  }
  const finalStatus = parsed.data.contentStatus ?? current.contentStatus;
  const finalSource =
    parsed.data.sourceReference !== undefined
      ? parsed.data.sourceReference
      : current.sourceReference;
  if (finalStatus === "verified" && !finalSource?.trim()) {
    res.status(400).json({
      error: "A source reference is required before verifying this question.",
    });
    return;
  }
  const [updated] = await db
    .update(questionsTable)
    .set(parsed.data)
    .where(eq(questionsTable.id, current.id))
    .returning({
      id: questionsTable.id,
      lessonId: questionsTable.lessonId,
      prompt: questionsTable.prompt,
      kind: questionsTable.kind,
      options: questionsTable.options,
      correctOption: questionsTable.correctOption,
      explanation: questionsTable.explanation,
      position: questionsTable.position,
      contentStatus: questionsTable.contentStatus,
      sourceReference: questionsTable.sourceReference,
    });
  res.json(UpdateQuestionResponse.parse(updated));
});

router.delete("/:questionId", async (req, res): Promise<void> => {
  const params = DeleteQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [question] = await db
    .select({
      id: questionsTable.id,
      lessonId: questionsTable.lessonId,
    })
    .from(questionsTable)
    .where(eq(questionsTable.id, params.data.questionId))
    .limit(1);
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  const [lesson] = await db
    .select({ contentStatus: lessonsTable.contentStatus })
    .from(lessonsTable)
    .where(eq(lessonsTable.id, question.lessonId))
    .limit(1);
  if (lesson?.contentStatus === "verified") {
    res.status(400).json({
      error: "Move the lesson back to draft before editing its questions.",
    });
    return;
  }
  await db.delete(questionsTable).where(eq(questionsTable.id, question.id));
  res.sendStatus(204);
});

export default router;

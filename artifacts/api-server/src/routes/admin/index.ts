import { Router, type IRouter } from "express";
import curriculumRouter from "./curriculum";
import questionsRouter from "./questions";
import studentsRouter from "./students";

const router: IRouter = Router();

router.use(curriculumRouter);
router.use("/questions", questionsRouter);
router.use("/students", studentsRouter);

export default router;

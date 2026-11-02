import { Router, type IRouter } from "express";
import healthRouter from "./health";
import curriculumRouter from "./curriculum";
import studentsRouter from "./students";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(curriculumRouter);
router.use(studentsRouter);
router.use("/admin", adminRouter);

export default router;

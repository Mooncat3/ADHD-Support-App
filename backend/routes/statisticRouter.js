import express from "express";
import * as statisticController from "../controllers/statisticController.js";
import { authenticate } from "../middlewares/authentication.js";
import { checkUserRole } from "../middlewares/checkUserRole.js";

const router = express.Router();

router.use(authenticate);
router.use(checkUserRole(0));

router.post("/file/:patientId", statisticController.getStatisticsFile);
router.post("/mail/:patientId", statisticController.sendFileEmail);

export default router;

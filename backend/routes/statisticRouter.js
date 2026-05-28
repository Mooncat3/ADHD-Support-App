import express from "express";
import * as statisticController from "../controllers/statisticController.js";
import { authenticate } from "../middlewares/authentication.js";
import { checkUserRole } from "../middlewares/checkUserRole.js";
import { checkPatientOwnership } from "../middlewares/checkPatientOwnership.js";

const router = express.Router();

router.use(authenticate);
router.use(checkUserRole(0));

// checkPatientOwnership проверяет, что patientId принадлежит текущему врачу
// — защита от IDOR (перебор чужих patientId в URL)
router.post("/file/:patientId", checkPatientOwnership, statisticController.getStatisticsFile);
router.post("/mail/:patientId", checkPatientOwnership, statisticController.sendFileEmail);
router.get("/get/:patientId",  checkPatientOwnership, statisticController.getStatistics);

export default router;

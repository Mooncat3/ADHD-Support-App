import express from "express";
import * as doctorController from "../controllers/doctorController.js";
import { authenticate } from "../middlewares/authentication.js";
import { checkUserRole } from "../middlewares/checkUserRole.js";

const router = express.Router();

router.use(authenticate);
router.use(checkUserRole(0));

router.get("/get", doctorController.get);
router.get("/patients", doctorController.getPatients);
router.post("/register", doctorController.registerPatient);
router.get("/createPdf", doctorController.getStatisticsFile);
router.get("/activity/:patientId", doctorController.getActivity);
router.put("/activity/:patientId", doctorController.putActivity);
router.post("/sendFileEmail", doctorController.sendFileEmail);

export default router;

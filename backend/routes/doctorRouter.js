import express from "express";
import * as doctorController from "../controllers/doctorController.js";
import { authenticate } from "../middlewares/authentication.js";
import { checkUserRole } from "../middlewares/checkUserRole.js";
import { checkPatientOwnership } from "../middlewares/checkPatientOwnership.js";

const router = express.Router();

router.use(authenticate);
router.use(checkUserRole(0));

router.get("/get", doctorController.get);

router.get("/patients", doctorController.getPatients);
router.post("/register", doctorController.registerPatient);

// checkPatientOwnership защищает от IDOR при обращении к данным пациента
router.get("/activity/:patientId", checkPatientOwnership, doctorController.getActivity);
router.put("/activity/:patientId", checkPatientOwnership, doctorController.putActivity);

export default router;

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

router.get("/activity/:patientId", doctorController.getActivity);
router.put("/activity/:patientId", doctorController.putActivity);

export default router;

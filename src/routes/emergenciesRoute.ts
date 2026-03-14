import express from "express";
import * as emergenciesController from "../controllers/emergencies";

const router = express.Router();

router.get("/", emergenciesController.getEmergencies);
router.get("/active", emergenciesController.getActiveEmergencies);
router.get("/:id", emergenciesController.getEmergencyById);

export default router;

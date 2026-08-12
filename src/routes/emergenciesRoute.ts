import express from "express";
import * as emergenciesController from "../controllers/emergencies";
import { cacheControl } from "../middleware/cacheControl";

const router = express.Router();

router.get("/", cacheControl(60, 30), emergenciesController.getEmergencies);
router.get("/active", cacheControl(60, 30), emergenciesController.getActiveEmergencies);
router.get("/:id", cacheControl(60, 30), emergenciesController.getEmergencyById);

export default router;

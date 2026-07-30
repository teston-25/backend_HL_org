import express from "express";
import * as emergenciesController from "../controllers/emergencies";
import { cacheControl } from "../middleware/cacheControl";

const router = express.Router();

router.get("/", cacheControl(300), emergenciesController.getEmergencies);
router.get("/active", cacheControl(60), emergenciesController.getActiveEmergencies);
router.get("/:id", cacheControl(300), emergenciesController.getEmergencyById);

export default router;

import express from "express";
import * as emergenciesController from "../controllers/emergencies";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createEmergencySchema,
  updateEmergencySchema,
} from "../validations/emergencyValidation";

const router = express.Router();

// Public Routes
router.get("/", emergenciesController.getEmergencies);
router.get("/active", emergenciesController.getActiveEmergencies);
router.get("/:id", emergenciesController.getEmergencyById);

// Admin Routes
router.use(authenticate, requireRole(["ADMIN", "SUPER_ADMIN"]));
router.post(
  "/",
  validate(createEmergencySchema),
  emergenciesController.createEmergency,
);

router.put(
  "/:id",
  validate(updateEmergencySchema),
  emergenciesController.updateEmergency,
);

router.delete("/:id", emergenciesController.deleteEmergency);

export default router;

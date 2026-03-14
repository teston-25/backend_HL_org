import express from "express";
import * as adminController from "../controllers/admin";
import * as donationController from "../controllers/donation";
import * as newsController from "../controllers/news";
import * as emergenciesController from "../controllers/emergencies";
import * as beneficiaryController from "../controllers/beneficiaryStats";
import { uploadTransparencyPDF } from "../controllers/transparency";
import multer from "multer";

import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

// Validations
import {
  loginSchema,
  createAdminSchema,
  updateAdminSchema,
  updatePasswordSchema,
  adminIdParamSchema,
} from "../validations/adminvalidation";
import {
  createNewsSchema,
  updateNewsSchema,
} from "../validations/newsValidation";
import {
  createEmergencySchema,
  updateEmergencySchema,
} from "../validations/emergencyValidation";
import { updateBeneficiaryStatsSchema } from "../validations/beneficiaryStatsValidation";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// --- Public ---
router.post("/login", validate(loginSchema), adminController.login);

// --- Protected ---
router.use(authenticate);

// --- Admin management ---
router.use(requireRole("SUPER_ADMIN"));
router.post("/", validate(createAdminSchema), adminController.createAdmin);
router.put(
  "/:id",
  validate(adminIdParamSchema, "params"),
  validate(updateAdminSchema),
  adminController.updateAdmin,
);
router.delete(
  "/:id",
  validate(adminIdParamSchema, "params"),
  adminController.deleteAdmin,
);

// --- Password update for all admins ---
router.use(requireRole(["ADMIN", "SUPER_ADMIN"]));
router.get("/", adminController.getAdmins);
router.put(
  "/password/me",
  validate(updatePasswordSchema),
  adminController.updateMyPassword,
);

// --- Contacts (Admin + Super Admin) ---
router.get("/contacts", adminController.getAllContacts);
router.get("/contacts/:id", adminController.getContact);
router.delete("/contacts/:id", adminController.deleteContact);

// --- Donations ---
router.get("/donations", donationController.getAllDonations);
router.get("/donations/stats", donationController.getDonationStats);

// --- News ---
router.post("/news", validate(createNewsSchema), newsController.createNews);
router.put("/news/:id", validate(updateNewsSchema), newsController.updateNews);
router.delete("/news/:id", newsController.deleteNews);

// --- Emergencies ---
router.post(
  "/emergencies",
  validate(createEmergencySchema),
  emergenciesController.createEmergency,
);
router.put(
  "/emergencies/:id",
  validate(updateEmergencySchema),
  emergenciesController.updateEmergency,
);
router.delete("/emergencies/:id", emergenciesController.deleteEmergency);

// --- Beneficiary stats ---
router.put(
  "/beneficiary-stats",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(updateBeneficiaryStatsSchema),
  beneficiaryController.updateBeneficiaryStats,
);

// --- Transparency PDF ---
router.post(
  "/transparency",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  upload.single("file"),
  uploadTransparencyPDF,
);

export default router;

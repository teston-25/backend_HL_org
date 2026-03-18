import express from "express";
import * as adminController from "../controllers/admin";
import * as donationController from "../controllers/donation";
import * as newsController from "../controllers/news";
import * as emergenciesController from "../controllers/emergencies";
import * as beneficiaryController from "../controllers/beneficiaryStats";
import {
  deleteTransparencyFile,
  updateTransparencyFile,
  uploadTransparencyPDF,
} from "../controllers/transparency";
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
import { adminLoginLimiter } from "../services/loginRateLimiter";
import AppError from "../services/AppError";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError("Only PDF files are allowed", 400) as any, false);
    }
  },
});

// --- Public ---
router.post(
  "/login",
  adminLoginLimiter,
  validate(loginSchema),
  adminController.login,
);
// router.post("/", validate(createAdminSchema), adminController.createAdmin);

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
// router.use(requireRole(["ADMIN", "SUPER_ADMIN"]));
router.get("/", adminController.getAdmins);
router.put(
  "/password/me",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validate(updatePasswordSchema),
  adminController.updateMyPassword,
);

// --- Contacts (Admin + Super Admin) ---
router.get(
  "/contacts",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  adminController.getAllContacts,
);
router.get(
  "/contacts/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  adminController.getContact,
);
router.delete(
  "/contacts/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  adminController.deleteContact,
);

// --- Donations ---
router.get(
  "/donations",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  donationController.getAllDonations,
);
router.get(
  "/donations/stats",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  donationController.getDonationStats,
);

// --- News ---
router.post(
  "/news",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validate(createNewsSchema),
  newsController.createNews,
);
router.put(
  "/news/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validate(updateNewsSchema),
  newsController.updateNews,
);
router.delete(
  "/news/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  newsController.deleteNews,
);

// --- Emergencies ---
router.post(
  "/emergencies",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validate(createEmergencySchema),
  emergenciesController.createEmergency,
);
router.put(
  "/emergencies/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validate(updateEmergencySchema),
  emergenciesController.updateEmergency,
);
router.delete(
  "/emergencies/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  emergenciesController.deleteEmergency,
);

// --- Beneficiary stats ---
router.put(
  "/beneficiary-stats",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  validate(updateBeneficiaryStatsSchema),
  beneficiaryController.updateBeneficiaryStats,
);

// --- Transparency PDF ---
router.post(
  "/transparency",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  upload.single("file"),
  uploadTransparencyPDF,
);
router.put(
  "/transparency/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  upload.single("file"),
  updateTransparencyFile,
);
router.delete(
  "/transparency/:id",
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  deleteTransparencyFile,
);

export default router;

import express from "express";
import * as adminController from "../controllers/admin";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  loginSchema,
  createAdminSchema,
  updateAdminSchema,
  updatePasswordSchema,
  adminIdParamSchema,
} from "../../validations/adminvalidation";

const router = express.Router();

// Public admin routes
router.post("/login", validate(loginSchema), adminController.login);

// Protected admin routes
router.use(authenticate);

// Admin management (Super Admin only)
router.get("/admins", requireRole("SUPER_ADMIN"), adminController.getAdmins);
router.post(
  "/admins",
  validate(createAdminSchema),
  adminController.createAdmin,
);
router.put(
  "/admins/:id",
  requireRole("SUPER_ADMIN"),
  validate(updateAdminSchema, "params"),
  adminController.updateAdmin,
);
router.delete(
  "/admins/:id",
  requireRole("SUPER_ADMIN"),
  validate(adminIdParamSchema, "params"),
  adminController.deleteAdmin,
);

// Password update (any logged-in admin)
router.put(
  "/password/me",
  validate(updatePasswordSchema),
  adminController.updateMyPassword,
);

// Other admin endpoints (to be implemented)
// router.get("/news", adminController.getNews); // placeholder
// router.post("/news", adminController.createNews); // placeholder
// router.put("/news/:id", adminController.updateNews); // placeholder
// router.delete("/news/:id", adminController.deleteNews); // placeholder
// router.get("/contacts", adminController.getContacts); // placeholder
// router.get("/donations", adminController.getDonations); // placeholder
// Add more as needed

export default router;

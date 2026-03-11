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
router.get("/", requireRole("SUPER_ADMIN"), adminController.getAdmins);
router.post("/", validate(createAdminSchema), adminController.createAdmin);
router.put(
  "/:id",
  requireRole("SUPER_ADMIN"),
  validate(updateAdminSchema, "params"),
  adminController.updateAdmin,
);
router.delete(
  "/:id",
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

// other super_admin and admin endpoints for managing contacts
router.get("/contacts", adminController.getAllContacts);
router.get("/contacts/:id", adminController.getContact);
router.delete("/contacts/:id", adminController.deleteContact);

export default router;

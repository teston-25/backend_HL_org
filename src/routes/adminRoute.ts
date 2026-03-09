import express from "express";
import * as adminController from "../controllers/admin";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

// Public admin routes
router.post("/login", adminController.login);

// Protected admin routes
router.use(authenticate);

// Admin management (Super Admin only)
router.get("/admins", requireRole("SUPER_ADMIN"), adminController.getAdmins);
router.post("/admins", adminController.createAdmin);
router.put(
  "/admins/:id",
  requireRole("SUPER_ADMIN"),
  adminController.updateAdmin,
);
router.delete(
  "/admins/:id",
  requireRole("SUPER_ADMIN"),
  adminController.deleteAdmin,
);

// Password update (any logged-in admin)
router.put("/password/me", adminController.updateMyPassword);

// Other admin endpoints (to be implemented)
// router.get("/news", adminController.getNews); // placeholder
// router.post("/news", adminController.createNews); // placeholder
// router.put("/news/:id", adminController.updateNews); // placeholder
// router.delete("/news/:id", adminController.deleteNews); // placeholder
// router.get("/contacts", adminController.getContacts); // placeholder
// router.get("/donations", adminController.getDonations); // placeholder
// Add more as needed

export default router;

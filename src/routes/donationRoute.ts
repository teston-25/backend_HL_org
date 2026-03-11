import express from "express";
import * as donationController from "../controllers/donation";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

router.use(authenticate);
router.use(requireRole(["SUPER_ADMIN", "ADMIN"]));

router.get("/", donationController.getAllDonations);
router.get("/stats", donationController.getDonationStats);

export default router;

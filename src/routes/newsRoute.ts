import express from "express";
import * as newscontroller from "../../src/controllers/news";
import { authenticate, requireRole } from "../../src/middleware/auth";
import { validate } from "../../src/middleware/validate";
import {
  createNewsSchema,
  updateNewsSchema,
} from "../validations/newsValidation";

const router = express.Router();

// Public GET routes
router.get("/", newscontroller.getNews);
router.get("/:id", newscontroller.getNewsById);

// Protected routes
router.post(
  "/",
  authenticate,
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(createNewsSchema),
  newscontroller.createNews,
);
router.put(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(updateNewsSchema),
  newscontroller.updateNews,
);
router.delete(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  newscontroller.deleteNews,
);

export default router;

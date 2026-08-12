import express from "express";
import * as transparencyController from "../controllers/transparency";
import { cacheControl } from "../middleware/cacheControl";

const router = express.Router();

router.get("/", cacheControl(60, 30), transparencyController.getAllTransparencyFiles);
router.get("/:id", cacheControl(60, 30), transparencyController.getTransparencyFile);

export default router;

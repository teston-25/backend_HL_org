import express from "express";
import * as transparencyController from "../controllers/transparency";

const router = express.Router();

router.get("/", transparencyController.getAllTransparencyFiles);
router.get("/:id", transparencyController.getTransparencyFile);

export default router;

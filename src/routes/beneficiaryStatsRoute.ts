import express from "express";
import * as beneficiaryController from "../controllers/beneficiaryStats";

const router = express.Router();

router.get("/", beneficiaryController.getBeneficiaryStats);

export default router;

import express from "express";
import * as beneficiaryController from "../controllers/beneficiaryStats";

const router = express.Router();

router.get("/beneficiary-stats", beneficiaryController.getBeneficiaryStats);

export default router;

import express from "express";
import * as beneficiaryController from "../controllers/beneficiaryStats";
import { cacheControl } from "../middleware/cacheControl";

const router = express.Router();

router.get("/", cacheControl(300), beneficiaryController.getBeneficiaryStats);

export default router;

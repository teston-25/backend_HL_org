import { Router } from "express";
import { proxyImage } from "../controllers/media";

const router = Router();
router.get("/image", proxyImage);

export default router;

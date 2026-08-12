import express from "express";
import * as newscontroller from "../controllers/news";
import { cacheControl } from "../middleware/cacheControl";

const router = express.Router();

router.get("/", cacheControl(60, 30), newscontroller.getNews);
router.get("/:id", cacheControl(60, 30), newscontroller.getNewsById);

export default router;

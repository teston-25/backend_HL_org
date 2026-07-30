import express from "express";
import * as newscontroller from "../controllers/news";
import { cacheControl } from "../middleware/cacheControl";

const router = express.Router();

router.get("/", cacheControl(300), newscontroller.getNews);
router.get("/:id", cacheControl(300), newscontroller.getNewsById);

export default router;

import express from "express";
import * as newscontroller from "../../src/controllers/news";

const router = express.Router();

router.get("/", newscontroller.getNews);
router.get("/:id", newscontroller.getNewsById);

export default router;

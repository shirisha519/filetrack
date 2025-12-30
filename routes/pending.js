import express from "express";
import { getPendingFiles } from "../controllers/pending.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/pending/search",authMiddleware, getPendingFiles);

export default router;

import express from "express";
import { getPendingFiles } from "../controllers/pending.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/", protect, getPendingFiles);

export default router;

import express from "express";
import { searchPendingTapal, downloadPendingExcel } from "../controllers/tapalPendingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/",authMiddleware,searchPendingTapal);              // search filters
router.post("/download",authMiddleware,downloadPendingExcel);     // excel download

export default router;

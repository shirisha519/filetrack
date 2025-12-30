// routes/inward.js
import express from "express";
import {
  getNextInwardNo,
  createInward,
  upload,
  searchInward,
  viewInwardFile,
  downloadInwardFile,
  // searchInward, exportInward
} from "../controllers/inward.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/next-inward-no",authMiddleware,getNextInwardNo);

// IMPORTANT: use upload.array('files') because frontend sends many files
router.post("/", upload.array("documents", 10000),authMiddleware,createInward);
router.post("/search",authMiddleware,searchInward);  
// ✅ NEW — VIEW FILE
router.get("/view/:inwardNo",authMiddleware, viewInwardFile);

// ✅ NEW — DOWNLOAD FILE
router.get("/download/:inwardNo", authMiddleware,downloadInwardFile);

router.post("/export", /* exportInward */ (req,res)=>{/*...*/});

export default router;

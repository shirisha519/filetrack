import express from "express";
import { getFileStatuses, updateFileStatus, searchFiles,viewOutwardFile,exportFilesExcel } from "../controllers/file.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();



router.get("/statuses",authMiddleware, getFileStatuses);
router.post("/update",authMiddleware,updateFileStatus);
router.post("/search",authMiddleware,searchFiles);
router.get("/view/:id/:index?", authMiddleware,viewOutwardFile);
router.post("/export",authMiddleware,exportFilesExcel);


export default router;

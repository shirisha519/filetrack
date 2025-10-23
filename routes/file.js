import express from "express";
import { getFileStatuses, updateFileStatus, getPendingFiles, getAllFiles } from "../controllers/file.controller.js";
const router = express.Router();

router.get("/all-files", getAllFiles);
router.get("/statuses", getFileStatuses);
router.post("/update-status", updateFileStatus);
router.get("/pending", getPendingFiles);

export default router;

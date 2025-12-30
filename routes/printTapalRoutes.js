import express from "express";
import { printTapal, downloadPrintTapalExcel } from "../controllers/printTapalController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/print",authMiddleware,printTapal);                  // fetch data
router.post("/print/download",authMiddleware,downloadPrintTapalExcel); // download Excel

export default router;

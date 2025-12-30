



import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateOutwardNo, saveOutward,outwardUpload,getOutwardRange, exportOutwardExcel,viewOutwardFile} from "../controllers/outward-controller.js";
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.get("/generate-no", authMiddleware,generateOutwardNo);
router.post("/save",authMiddleware,outwardUpload, saveOutward); // Use /save route

router.get("/range", authMiddleware,getOutwardRange);
router.get("/view/:outwardNo",authMiddleware,viewOutwardFile);

router.post("/export",authMiddleware,exportOutwardExcel);


export default router;

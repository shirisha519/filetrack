import express from "express";
import { getNextInwardNumber, createInward, searchInward } from "../controllers/inward.controller.js";
const router = express.Router();

router.get("/next-inward-no", getNextInwardNumber);
router.post("/", createInward);
router.post("/search", searchInward);


export default router;

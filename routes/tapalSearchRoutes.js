import express from 'express';
import { searchTapal } from '../controllers/tapalSearchController.js';
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/search',authMiddleware,searchTapal);

export default router;

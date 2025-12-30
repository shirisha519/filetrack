import express from 'express';
import { addTapalReceived, getAllTapalReceived } from '../controllers/tapalReceivedController.js';
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/add',authMiddleware,addTapalReceived);
router.get('/all',authMiddleware,getAllTapalReceived);

export default router;

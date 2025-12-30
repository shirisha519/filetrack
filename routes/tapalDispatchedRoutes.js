import express from 'express';
import { addTapalDispatched, getAllDispatched } from '../controllers/tapalDispatchedController.js';
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/dispatched',authMiddleware,addTapalDispatched);  // correct URL
router.get('/dispatched/all',authMiddleware,getAllDispatched); // optional but consistent

export default router;

import express from 'express';
import { logStudySession } from '../controllers/timerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/session', protect, logStudySession);

export default router;

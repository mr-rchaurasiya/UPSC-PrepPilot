import express from 'express';
import { submitMainsAnswer, getAnswerHistory, getEvaluationReport } from '../controllers/mainsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', protect, submitMainsAnswer);
router.get('/history', protect, getAnswerHistory);
router.get('/evaluation/:id', protect, getEvaluationReport);

export default router;

import express from 'express';
import { submitMockTest, getMockTestHistory } from '../controllers/mockTestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', protect, submitMockTest);
router.get('/history', protect, getMockTestHistory);

export default router;

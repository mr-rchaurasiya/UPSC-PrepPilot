import express from 'express';
import { getDashboardAnalytics, getCompleteAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/complete', protect, getCompleteAnalytics);

export default router;

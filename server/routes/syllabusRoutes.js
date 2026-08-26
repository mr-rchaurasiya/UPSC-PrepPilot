import express from 'express';
import { 
  getSyllabus, 
  getProgress, 
  updateProgress,
  getRevisionDashboard,
  rateRevisionTopic
} from '../controllers/syllabusController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSyllabus);
router.get('/progress', protect, getProgress);
router.put('/progress/:topicId', protect, updateProgress);
router.get('/revision/dashboard', protect, getRevisionDashboard);
router.post('/revision/:topicId/rate', protect, rateRevisionTopic);

export default router;

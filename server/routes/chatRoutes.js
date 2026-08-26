import express from 'express';
import { getChatHistory, sendChatMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', protect, getChatHistory);
router.post('/', protect, apiLimiter, sendChatMessage);

export default router;

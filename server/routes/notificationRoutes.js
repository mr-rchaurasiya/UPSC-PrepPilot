import express from 'express';
import {
  getNotificationsList,
  markReadNotification,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotificationsList);
router.put('/read-all', protect, markAllNotificationsRead);
router.put('/:id/read', protect, markReadNotification);
router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);

export default router;

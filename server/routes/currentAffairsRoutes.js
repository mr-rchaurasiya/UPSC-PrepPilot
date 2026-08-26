import express from 'express';
import {
  getCurrentAffairsList,
  toggleBookmarkNews,
  toggleReadNews,
  saveNewsNote,
  addToRevisionQueue,
  generateNewsMCQ,
  generateNewsMains
} from '../controllers/currentAffairsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCurrentAffairsList);
router.post('/:id/bookmark', protect, toggleBookmarkNews);
router.post('/:id/read', protect, toggleReadNews);
router.post('/:id/note', protect, saveNewsNote);
router.post('/:id/revision', protect, addToRevisionQueue);
router.post('/:id/generate-mcq', protect, generateNewsMCQ);
router.post('/:id/generate-mains', protect, generateNewsMains);

export default router;

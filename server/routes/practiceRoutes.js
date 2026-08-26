import express from 'express';
import { 
  getPracticeQuestions, 
  submitPracticeAnswer, 
  getMistakes, 
  resolveMistake,
  toggleBookmark,
  getBookmarks,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateMistake,
  deleteMistake
} from '../controllers/practiceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/questions', protect, getPracticeQuestions);
router.post('/questions/submit', protect, submitPracticeAnswer);
router.get('/questions/bookmarks', protect, getBookmarks);
router.put('/questions/:id/bookmark', protect, toggleBookmark);
router.get('/mistakes', protect, getMistakes);
router.put('/mistakes/:id', protect, updateMistake);
router.delete('/mistakes/:id', protect, deleteMistake);
router.put('/mistakes/:id/resolve', protect, resolveMistake);

// Admin Question Management Routes
router.post('/questions', protect, authorizeRoles('admin'), createQuestion);
router.put('/questions/:id', protect, authorizeRoles('admin'), updateQuestion);
router.delete('/questions/:id', protect, authorizeRoles('admin'), deleteQuestion);

export default router;

import express from 'express';
import { 
  getTasks, 
  createTask, 
  toggleTaskStatus, 
  updateTask,
  deleteTask, 
  generateStudyPlan,
  acceptBulkPlan
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.put('/:id/toggle', protect, toggleTaskStatus);
router.delete('/:id', protect, deleteTask);
router.post('/generate-plan', protect, generateStudyPlan);
router.post('/bulk-accept', protect, acceptBulkPlan);

export default router;

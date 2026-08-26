import express from 'express';
import {
  getAdminOverview,
  getAdminUsers,
  updateUserStatus,
  updateUserRole
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce admin authorization on all routes
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/overview', getAdminOverview);
router.get('/users', getAdminUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

export default router;

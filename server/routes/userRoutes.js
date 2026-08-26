import express from 'express';
import { onboardStudent, updateProfile } from '../controllers/userController.js';
import { onboardingValidator } from '../validators/authValidators.js';
import validateResult from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/onboarding', protect, onboardingValidator, validateResult, onboardStudent);
router.put('/profile', protect, updateProfile);

export default router;

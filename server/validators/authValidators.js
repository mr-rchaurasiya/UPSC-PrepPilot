import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .withMessage('Provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter')
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const onboardingValidator = [
  body('targetExamYear')
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
    .withMessage('Please select a valid upcoming exam year'),
  body('attemptNumber')
    .isInt({ min: 1, max: 10 })
    .withMessage('Attempt count must be a number between 1 and 10'),
  body('currentPreparationLevel')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid preparation level selection'),
  body('primaryPriority')
    .isIn(['Prelims', 'Mains', 'Both'])
    .withMessage('Invalid priority selection'),
  body('optionalSubject')
    .notEmpty()
    .withMessage('Optional subject is required')
    .trim(),
  body('availableStudyHoursPerDay')
    .isInt({ min: 1, max: 24 })
    .withMessage('Daily hours must be between 1 and 24 hours')
];

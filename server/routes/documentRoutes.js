import express from 'express';
import {
  getDocuments,
  uploadDocument,
  renameDocument,
  categorizeDocument,
  deleteDocument,
  askDocumentAssistant
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDocuments);
router.post('/', protect, uploadDocument);
router.put('/:id/rename', protect, renameDocument);
router.put('/:id/categorize', protect, categorizeDocument);
router.delete('/:id', protect, deleteDocument);
router.post('/:id/assistant', protect, askDocumentAssistant);

export default router;

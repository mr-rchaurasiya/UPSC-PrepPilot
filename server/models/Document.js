import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true, trim: true },
  fileSize: { type: String },
  fileType: { type: String },
  category: { type: String, default: 'General' },
  filePath: { type: String }
}, {
  timestamps: true
});

export const DocumentModel = mongoose.model('Document', DocumentSchema);
export default DocumentModel;

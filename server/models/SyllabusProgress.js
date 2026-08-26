import mongoose from 'mongoose';

const SyllabusProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusTopic', required: true },
  status: { type: String, enum: ['Not Started', 'Learning', 'Completed', 'Revised', 'Strong', 'Weak'], default: 'Not Started' },
  confidence: { type: Number, min: 1, max: 5, default: 3 },
  revisionCount: { type: Number, default: 0 },
  lastRevisedAt: { type: Date },
  nextRevisionDate: { type: Date },
  studyTime: { type: Number, default: 0 }, // in minutes
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

SyllabusProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

export const SyllabusProgress = mongoose.model('SyllabusProgress', SyllabusProgressSchema);
export default SyllabusProgress;

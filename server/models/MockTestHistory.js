import mongoose from 'mongoose';

const MockTestHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['Topic Practice', 'Subject Practice', 'Mixed Practice', 'Weak Topic Practice', 'Previous Mistakes', 'Full Mock Test'], required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  attempted: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  skipped: { type: Number, required: true },
  negativeMarks: { type: Number, default: 0 },
  accuracy: { type: Number, required: true },
  timeSpentSeconds: { type: Number, required: true },
  subjectBreakdown: [{
    subject: String,
    total: Number,
    correct: Number
  }]
}, {
  timestamps: true
});

export const MockTestHistory = mongoose.model('MockTestHistory', MockTestHistorySchema);
export default MockTestHistory;

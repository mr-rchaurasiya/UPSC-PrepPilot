import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  paper: { type: String, enum: ['GS1', 'CSAT'], required: true },
  examStage: { type: String, enum: ['prelims', 'mains'], default: 'prelims' },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusTopic' },
  questionText: { type: String, required: true, trim: true },
  options: [{ type: String, required: true }], // Must have exactly 4 choices
  correctOption: { type: Number, required: true, min: 0, max: 3 }, // 0 to 3 index
  explanation: { type: String, trim: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  source: { type: String, enum: ['pyq', 'mcq'], default: 'mcq' },
  year: { type: Number }, // Present only if source is 'pyq'
  reference: { type: String },
  tags: [{ type: String }],
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, required: true },
    details: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const Question = mongoose.model('Question', QuestionSchema);
export default Question;

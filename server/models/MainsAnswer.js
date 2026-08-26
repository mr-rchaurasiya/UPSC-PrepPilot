import mongoose from 'mongoose';

const MainsAnswerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionText: { type: String, required: true, trim: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusTopic' },
  answerText: { type: String, required: true },
  attachments: [{ type: String }],
  status: { type: String, enum: ['pending', 'evaluated'], default: 'pending' },
  
  // Question Meta
  questionYear: { type: Number },
  questionPaper: { type: String },
  questionSubject: { type: String },
  questionTopic: { type: String },
  questionMarks: { type: Number },
  questionWordLimit: { type: Number },
  questionDirective: { type: String },

  evaluation: {
    score: { type: Number }, // Out of 10 or 15
    introScore: { type: Number },
    bodyScore: { type: Number },
    conclusionScore: { type: Number },
    structureFeedback: { type: String, trim: true },
    contentFeedback: { type: String, trim: true },
    suggestions: [{ type: String, trim: true }],
    evaluatedAt: { type: Date },

    // Mains Specifics
    strengths: [{ type: String, trim: true }],
    weaknesses: [{ type: String, trim: true }],
    missingDimensions: [{ type: String, trim: true }],
    improvementSuggestions: [{ type: String, trim: true }],
    idealStructure: { type: String },
    suggestedExamples: [{ type: String, trim: true }],
    suggestedConclusion: { type: String },
    estimatedWordCount: { type: Number },
    modelAnswerOutline: { type: String },
    isAdvisory: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export const MainsAnswer = mongoose.model('MainsAnswer', MainsAnswerSchema);
export default MainsAnswer;

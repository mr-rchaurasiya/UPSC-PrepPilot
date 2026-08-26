import mongoose from 'mongoose';

const MistakeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: Number, required: true },
  status: { type: String, enum: ['unresolved', 'resolved'], default: 'unresolved' },
  repeatedCount: { type: Number, default: 1 },
  confidenceLevel: { type: Number, default: 3, min: 1, max: 5 },
  category: { 
    type: String, 
    enum: [
      'Conceptual mistake', 
      'Factual mistake', 
      'Misreading', 
      'Elimination mistake', 
      'Guessing mistake', 
      'Time pressure', 
      'Careless mistake',
      'Other'
    ], 
    default: 'Conceptual mistake' 
  },
  personalNote: { type: String, default: '' }
}, {
  timestamps: true
});

MistakeSchema.index({ user: 1, question: 1 }, { unique: true });

export const Mistake = mongoose.model('Mistake', MistakeSchema);
export default Mistake;

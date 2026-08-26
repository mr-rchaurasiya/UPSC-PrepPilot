import mongoose from 'mongoose';

const CurrentAffairsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true, default: Date.now },
  category: { type: String, required: true }, // e.g. National, International, Polity
  subject: { type: String, required: true }, // e.g. Polity, Economy, IR
  syllabusMapping: [{ type: String }],
  summary: { type: String, required: true },
  background: { type: String },
  whyImportant: { type: String },
  keyFacts: [{ type: String }],
  governmentInitiatives: [{ type: String }],
  constitutionalLegalAngle: { type: String },
  economicAngle: { type: String },
  environmentalAngle: { type: String },
  irAngle: { type: String },
  prelimsFacts: [{ type: String }],
  mainsDimensions: [{ type: String }],
  relatedPYQs: [{ type: String }],
  tags: [{ type: String }],
  source: { type: String, required: true }, // e.g. The Hindu, PIB

  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  userNotes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export const CurrentAffairs = mongoose.model('CurrentAffairs', CurrentAffairsSchema);
export default CurrentAffairs;

import mongoose from 'mongoose';

const SyllabusTopicSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  paper: { 
    type: String, 
    required: true, 
    enum: ['GS1', 'GS2', 'GS3', 'GS4', 'CSAT', 'Essay', 'Optional1', 'Optional2'] 
  },
  code: { type: String, required: true, unique: true, trim: true }, // e.g. 'GS2-POL-01'
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  subtopics: [{ type: String, trim: true }],
  status: { type: String, enum: ['active', 'draft'], default: 'active' }
}, {
  timestamps: true
});

export const SyllabusTopic = mongoose.model('SyllabusTopic', SyllabusTopicSchema);
export default SyllabusTopic;

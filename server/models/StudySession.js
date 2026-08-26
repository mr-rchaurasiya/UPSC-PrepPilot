import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusTopic' },
  subject: { type: String, trim: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  durationMinutes: { type: Number, required: true }, // actual duration
  plannedDurationMinutes: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'partial'], default: 'completed' },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, {
  timestamps: true
});

export const StudySession = mongoose.model('StudySession', StudySessionSchema);
export default StudySession;

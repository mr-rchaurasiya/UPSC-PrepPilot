import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['daily_task', 'weekly_goal', 'monthly_goal'], default: 'daily_task' },
  date: { type: Date, required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusTopic' },
  subject: { type: String, trim: true },
  activity: { type: String, trim: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  reason: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'completed', 'skipped'], default: 'pending' },
  durationMinutes: { type: Number, default: 0 },
  actualDurationMinutes: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Task = mongoose.model('Task', TaskSchema);
export default Task;

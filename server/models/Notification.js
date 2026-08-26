import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['revision', 'goal', 'test', 'streak', 'weak_topic', 'mains', 'recommendation'], 
    required: true 
  },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;

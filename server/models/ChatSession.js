import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    sender: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
export default ChatSession;

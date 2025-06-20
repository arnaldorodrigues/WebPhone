import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'unread',
    enum: ['unread', 'read', 'failed'],
  },
  type: {
    type: String,
    required: true,
    enum: ['chat', 'sms'],
    default: 'chat'
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ from: 1, to: 1, timestamp: -1 });
messageSchema.index({ type: 1, from: 1, to: 1 }); // Index for faster SMS queries

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message; 
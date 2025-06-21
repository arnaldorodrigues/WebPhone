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
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ from: 1, to: 1, timestamp: -1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message; 
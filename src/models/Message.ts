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
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient querying of conversations
messageSchema.index({ from: 1, to: 1, timestamp: -1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message; 
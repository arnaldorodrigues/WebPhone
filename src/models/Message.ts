import { MessageStatus } from '@/types/common';
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  from: string;
  to: string;
  body: string;
  status: MessageStatus;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema: Schema<IMessage> = new Schema<IMessage>(
  {
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.UNREAD,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default MessageModel;
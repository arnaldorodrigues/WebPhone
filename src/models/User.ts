import mongoose, { Schema } from 'mongoose';
import { User } from '../types/auth';

const userSchema: Schema = new Schema({
  extensionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.models.User || mongoose.model<User>('User', userSchema);

export default UserModel; 
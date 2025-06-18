import mongoose, { Schema } from 'mongoose';
import { User } from '../types/auth';

const userSchema: Schema = new Schema({
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
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  settings: {
    type: Schema.Types.ObjectId,
    ref: "Settings",
  },
  contacts: [Schema.Types.ObjectId],
});

const UserModel =
  mongoose.models.User || mongoose.model<User>("User", userSchema);

export default UserModel;
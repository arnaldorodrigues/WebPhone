import mongoose, { Schema } from 'mongoose';

export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  did?: string;  // Reference to SmsGateway
}

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
  contacts: [String],
  did: {
    type: Schema.Types.ObjectId,
    ref: "SmsGateway",
    required: false,
  },
});

const UserModel =
  mongoose.models.User || mongoose.model<User>("User", userSchema);

export default UserModel;
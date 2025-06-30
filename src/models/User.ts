import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  did?: string;
  settings?: string;
  contacts?: string[];
}

const userSchema: Schema<IUser> = new Schema<IUser>({
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
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;
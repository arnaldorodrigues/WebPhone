import { UserRole } from '@/types/common';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  sipServerId?: Types.ObjectId;
  smsGatewayId?: Types.ObjectId;
  settingId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
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
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    sipServerId: {
      type: Schema.Types.ObjectId,
      ref: "Server"
    },
    settingId: {
      type: Schema.Types.ObjectId,
      ref: "Setting",
    },
    smsGatewayId: {
      type: Schema.Types.ObjectId,
      ref: "SmsGateway",
      required: false,
    },
  },
  {
    timestamps: true
  }
);

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;
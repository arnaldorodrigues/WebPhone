import mongoose, { Document, model, models, Schema, Types } from 'mongoose';

export interface ISetting extends Document {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  domain: string;
  sipUsername: string;
  sipPassword: string;
  createdAt: Date;
  updatedAt: Date;
  user: Types.ObjectId;
}

const settingSchema: Schema<ISetting> = new Schema<ISetting>(
  {
    wsServer: {
      type: String,
      required: true,
      trim: true,
    },
    wsPort: {
      type: String,
      required: true,
      default: "7443",
      trim: true,
      match: /^\d+$/,
    },
    wsPath: {
      type: String,
      required: true,
      default: "/",
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    sipUsername: {
      type: String,
      required: true,
      trim: true,
    },
    sipPassword: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  {
    timestamps: true,
  }
);

settingSchema.index({ sipUsername: 1, domain: 1 }, { unique: true });

const SettingModel = models.Setting || model<ISetting>("Setting", settingSchema);

export default SettingModel;
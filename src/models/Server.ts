import mongoose, { Document, Schema } from "mongoose";

export interface IServer extends Document {
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
  createdAt: Date;
  updatedAt: Date;
}

const serverSchema: Schema<IServer> = new Schema<IServer>(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    wsServer: {
      type: String,
      required: true,
      trim: true,
    },
    wsPort: {
      type: String,
      required: true,
      trim: true,
      default: "7443",
      match: /^\d+$/,
    },
    wsPath: {
      type: String,
      default: "/",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

serverSchema.index({ domain: 1 }, { unique: true });

const ServerModel =
  mongoose.models.Server || mongoose.model<IServer>("Server", serverSchema);

export default ServerModel;
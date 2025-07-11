import mongoose, { Document, model, models, Schema } from "mongoose";

export interface ISipServer extends Document {
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
  createdAt: Date;
  updatedAt: Date;
}

const sipServerSchema: Schema<ISipServer> = new Schema<ISipServer>(
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

sipServerSchema.index({ domain: 1 }, { unique: true });

const SipServerModel = models.SipServer || model<ISipServer>("SipServer", sipServerSchema);

export default SipServerModel;
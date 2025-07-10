import { SmsGatewayType, SmsGatewayTypeValues } from "@/types/common";
import mongoose, { Document, Schema } from "mongoose";

export interface ISignalWireConfig {
  projectId: string;
  authToken: string;
  spaceUrl: string;
}

export interface IViConfig {
  apiKey: string;
  apiSecret: string;
}

export interface ISmsGateway extends Document {
  type: SmsGatewayType;
  didNumber: string;
  config: ISignalWireConfig | IViConfig;
  createdAt: Date;
  updatedAt: Date;
}

const smsGatewaySchema: Schema<ISmsGateway> = new Schema<ISmsGateway>(
  {
    type: {
      type: String,
      required: true,
      enum: SmsGatewayTypeValues,
    },
    didNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^\d+$/,
    },
    config: {
      type: Schema.Types.Mixed,
      required: true
    },
  },
  {
    timestamps: true,
  }
)

const SmsGatewayModel =
  mongoose.models.SmsGateway || mongoose.model<ISmsGateway>("SmsGateway", smsGatewaySchema);

export default SmsGatewayModel;
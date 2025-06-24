import mongoose from 'mongoose';

export interface ISignalwireConfig {
  projectId: string;
  authToken: string;
  spaceUrl: string;
  phoneNumber: string;
}

export interface IViConfig {
  apiKey: string;
  apiSecret: string;
  phoneNumber: string;
}

export interface ISmsGateway {
  _id?: string;
  type: 'signalwire' | 'vi';
  config: ISignalwireConfig | IViConfig;
  createdAt: Date;
  updatedAt: Date;
}

const signalwireConfigSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  projectId: { type: String, required: true },
  authToken: { type: String, required: true },
  spaceUrl: { type: String, required: true },
}, { _id: false });

const viConfigSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
}, { _id: false });

const smsGatewaySchema = new mongoose.Schema<ISmsGateway>(
  {
    type: { 
      type: String, 
      required: true,
      enum: ['signalwire', 'vi']
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    }
  },
  {
    timestamps: true
  }
);

export const SmsGateway = mongoose.models.SmsGateway || mongoose.model<ISmsGateway>('SmsGateway', smsGatewaySchema); 
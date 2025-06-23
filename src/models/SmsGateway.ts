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
  projectId: { type: String, required: true },
  authToken: { type: String, required: true },
  spaceUrl: { type: String, required: true },
  phoneNumber: { type: String, required: true }
}, { _id: false });

const viConfigSchema = new mongoose.Schema({
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  phoneNumber: { type: String, required: true }
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
      validate: {
        validator: function(value: any) {
          if (this.type === 'signalwire') {
            return value.projectId && value.authToken && value.spaceUrl && value.phoneNumber;
          } else if (this.type === 'vi') {
            return value.apiKey && value.apiSecret && value.phoneNumber;
          }
          return false;
        },
        message: 'Invalid configuration for SMS gateway type'
      }
    }
  },
  {
    timestamps: true
  }
);

export const SmsGateway = mongoose.models.SmsGateway || mongoose.model<ISmsGateway>('SmsGateway', smsGatewaySchema); 
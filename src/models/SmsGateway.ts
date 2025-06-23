import mongoose from 'mongoose';

export interface ISmsGateway {
  _id?: string;
  type: 'signalwire' | 'vi';
  projectId: string;
  authToken: string;
  spaceUrl: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const smsGatewaySchema = new mongoose.Schema<ISmsGateway>(
  {
    type: { 
      type: String, 
      required: true,
      enum: ['signalwire', 'vi']
    },
    projectId: { type: String, required: true },
    authToken: { type: String, required: true },
    spaceUrl: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export const SmsGateway = mongoose.models.SmsGateway || mongoose.model<ISmsGateway>('SmsGateway', smsGatewaySchema); 
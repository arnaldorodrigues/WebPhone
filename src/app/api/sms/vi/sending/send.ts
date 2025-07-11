import { Apidaze } from '@apidaze/node';
import connectDB from '@/lib/mongodb';
import { isValidObjectId } from 'mongoose';
import SmsGatewayModel from '@/models/SmsGateway';

export async function sendViSMS( fromId:string, to:string, messageBody:string ) {
  try {
    await connectDB();

    if (!fromId || !isValidObjectId(fromId)) {
      return { success: false, data: 'Invalid fromId provided', status: 400 };
    }

    const gateway = await SmsGatewayModel.findById(fromId);
    if (!gateway) {
      return { success: false, data: 'SMS gateway not found', status: 404 };
    }

    if (gateway.type !== 'vi') {
      return { success: false, error: 'Invalid gateway type. Expected VI gateway.', status: 400 };
    }

    const config = gateway.config as { apiKey: string; apiSecret: string; phoneNumber: string };

    const ApidazeClient = new Apidaze(
      config.apiKey,
      config.apiSecret
    );

    const response = await ApidazeClient.messages.send('1' + config.phoneNumber, '1' + to, messageBody);

    return { 
      success: true,
      data: response,
      status:200
    };
  } catch (error) {
    console.error('Error sending SMS through VI:', error);
    return { sucess: false, data: (error as Error).message, status: 500 };
  }
}
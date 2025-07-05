// @ts-ignore: SignalWire types export issue
import { RestClient } from '@signalwire/compatibility-api';
import connectDB from '@/lib/mongodb';
import { SmsGateway, ISignalwireConfig } from '@/models/SmsGateway__';
import { isValidObjectId } from 'mongoose';

export async function sendSignalWireSMS( fromId: string, to:string, messageBody:string ) {

  try {
    await connectDB();

    if (!fromId || !isValidObjectId(fromId)) {
      return {data: 'Invalid fromId provided', status: 400 };
    }

    const gateway = await SmsGateway.findById(fromId);
    if (!gateway) {
      return { success: false, data: 'SMS gateway not found', status: 404 };
    }

    if (gateway.type !== 'signalwire') {
      return { success: false, data: 'Invalid gateway type. Expected SignalWire gateway.', status: 400 };
    }

    const config = gateway.config as ISignalwireConfig;

    const client = new RestClient(
      config.projectId,
      config.authToken,
      { signalwireSpaceUrl: config.spaceUrl }
    );

    const response = await client.messages.create({
      from: '+1' + config.phoneNumber,
      to: '+1' + to,
      body: messageBody,
    });

    if (!response.sid || response.sid.toString().length === 0) {
      return { success: false, data: 'Failed to send SMS',  status: 500 };
    }

    return { 
      success: true,
      data: response,
      status: 200
    };

  } catch (error) {
    console.error('Error sending SMS through SignalWire:', error);
    return { sucess: false, data: (error as Error).message, status: 500 };
  }
}

import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore: SignalWire types export issue
import { RestClient } from '@signalwire/compatibility-api';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { SmsGateway, ISignalwireConfig } from '@/models/SmsGateway';
import { isValidObjectId } from 'mongoose';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fromId = body.fromId;
  const to = body.to;
  const messageBody = body.messageBody;

  try {
    await connectDB();

    if (!fromId || !isValidObjectId(fromId)) {
      return NextResponse.json({ error: 'Invalid fromId provided' }, { status: 400 });
    }

    const gateway = await SmsGateway.findById(fromId);
    if (!gateway) {
      return NextResponse.json({ error: 'SMS gateway not found' }, { status: 404 });
    }

    if (gateway.type !== 'signalwire') {
      return NextResponse.json({ error: 'Invalid gateway type. Expected SignalWire gateway.' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
    }

    const message = new Message({
      from: fromId,
      to,
      body: messageBody,
      timestamp: new Date()
    });

    await message.save();

    return NextResponse.json({ 
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending SMS through SignalWire:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

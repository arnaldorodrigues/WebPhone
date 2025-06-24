import { NextRequest, NextResponse } from 'next/server';
import { Apidaze } from '@apidaze/node';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { SmsGateway } from '@/models/SmsGateway';
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

    if (gateway.type !== 'vi') {
      return NextResponse.json({ error: 'Invalid gateway type. Expected VI gateway.' }, { status: 400 });
    }

    const config = gateway.config as { apiKey: string; apiSecret: string; phoneNumber: string };

    const ApidazeClient = new Apidaze(
      config.apiKey,
      config.apiSecret
    );

    const response = await ApidazeClient.messages.send('1' + config.phoneNumber, '1' + to, messageBody);

    const message = new Message({
      from: fromId,
      to: to,
      body: messageBody,
      timestamp: new Date()
    });
    await message.save();

    return NextResponse.json({ 
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error sending SMS through VI:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
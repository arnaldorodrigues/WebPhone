import { NextRequest, NextResponse } from 'next/server';
import { Apidaze } from '@apidaze/node';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { SmsGateway } from '@/models/SmsGateway';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const to = body.to;
  const messageBody = body.messageBody;

  try {
    await connectDB();

    const gateway = await SmsGateway.findOne({ type: 'vi' });
    if (!gateway) {
      return NextResponse.json({ error: 'No VI SMS gateway configured' }, { status: 500 });
    }

    const config = gateway.config as { apiKey: string; apiSecret: string; phoneNumber: string };

    const ApidazeClient = new Apidaze(
      config.apiKey,
      config.apiSecret
    );

    const response = await ApidazeClient.messages.send(config.phoneNumber, to, messageBody);

    const message = new Message({
      from: config.phoneNumber,
      to,
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
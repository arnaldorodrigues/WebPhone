import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore: SignalWire types export issue
import { RestClient } from '@signalwire/compatibility-api';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { SmsGateway, ISignalwireConfig } from '@/models/SmsGateway';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const to = body.to;
  const messageBody = body.messageBody;

  try {
    await connectDB();

    const gateway = await SmsGateway.findOne({ type: 'signalwire' });
    if (!gateway) {
      return NextResponse.json({ error: 'No SMS gateway configured' }, { status: 500 });
    }

    const config = gateway.config as ISignalwireConfig;

    const client = new RestClient(
      config.projectId,
      config.authToken,
      { signalwireSpaceUrl: config.spaceUrl }
    );

    const response = await client.messages.create({
      from: config.phoneNumber,
      to,
      body: messageBody,
    });

    const message = new Message({
      from: config.phoneNumber,
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
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const body = request.nextUrl.searchParams.get("body");
    const from = request.nextUrl.searchParams.get("from");
    
    const gateway = await SmsGateway.findOne({ type: 'signalwire' });
    if (!gateway) {
      return NextResponse.json({ error: 'No SMS gateway configured' }, { status: 500 });
    }

    const config = gateway.config as ISignalwireConfig;
    if (!body || !from) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const message = new Message({
      from,
      to: gateway.phoneNumber,
      body,
      timestamp: new Date()
    });
    await message.save();

    const response = new RestClient.LaML.MessagingResponse();
    response.message(body);

    return new NextResponse(response.toString(), {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
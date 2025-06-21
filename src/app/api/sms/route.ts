import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore: SignalWire types export issue
import { RestClient } from '@signalwire/compatibility-api';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

const client = new RestClient(
  process.env.SIGNALWIRE_PROJECT_ID!,
  process.env.SIGNALWIRE_AUTH_TOKEN!,
  { signalwireSpaceUrl: process.env.SIGNALWIRE_SPACE_URL! }
);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const to = body.to;
  const messageBody = body.messageBody;
  const from = process.env.NEXT_PUBLIC_SIGNALWIRE_PHONE_NUMBER!

  try {
    await connectDB();

    const response = await client.messages.create({
      from,
      to,
      body: messageBody,
    });

    const message = new Message({
      from,
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
    const to = process.env.NEXT_PUBLIC_SIGNALWIRE_PHONE_NUMBER!;

    if (!body || !from) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const message = new Message({
      from,
      to,
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
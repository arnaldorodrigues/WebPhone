import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { SmsGateway, IViConfig } from '@/models/SmsGateway';
import Message from '@/models/Message';

// In-memory store for demonstration; use a database in production
let messages: { from: string; to: string; body: string }[] = [];

async function validateSignature(req: NextRequest): Promise<boolean> {
  try {
    await connectDB();
    const gateway = await SmsGateway.findOne({ type: 'vi' });
    if (!gateway) {
      throw new Error('No VI gateway configured');
    }

    const config = gateway.config as IViConfig;
    const signature = req.headers.get('x-vi-signature');
    const timestamp = req.headers.get('x-timestamp');
    const body = await req.text();
    const data = timestamp + body;
    const expectedSignature = crypto
      .createHmac('sha256', config.apiSecret)
      .update(data)
      .digest('base64');
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error validating signature:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!await validateSignature(req)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const { From, To, Body } = await req.json();
    const message = new Message({
      from: From,
      to: To,
      body: Body,
      timestamp: new Date()
    });
    await message.save();

    console.log(`Received SMS from ${From} to ${To}: ${Body}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify(messages), { status: 200 });
}
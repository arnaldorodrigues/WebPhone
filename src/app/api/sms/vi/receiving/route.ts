import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { SmsGateway, IViConfig } from '@/models/SmsGateway';
import Message from '@/models/Message';
import { sendInternalMessage } from "@/utils/internal-websocket";
import UserModel from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { From, To, Body } = await req.json();

    const gateway = await SmsGateway.findOne({ type: 'vi', config: { phoneNumber: To.slice(1, -1) } });
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
      
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const message = new Message({
      from: From.slice(1, -1),
      to: gateway._id,
      body: Body,
      timestamp: new Date()
    });
    await message.save();

    // Find all users who have this DID assigned and send them the message via websocket
    const targets = await UserModel.find({
      "did": gateway._id
    });

    targets.forEach(target => {
      sendInternalMessage(target._id.toString(), 'new_sms', {
        messageId: message._id,
        from: message.from,
        to: gateway._id.toString(),
        body: message.body,
        timestamp: message.timestamp    
      });
    });

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
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { SmsGateway, IViConfig } from '@/models/SmsGateway';
import Message from '@/models/Message';
import UserModel from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('msisdn')?.toString();
    const to = formData.get('to')?.toString();
    const body = formData.get('text')?.toString() || '';

    await connectDB();
    
    const gateway = await SmsGateway.findOne({ type: 'vi', "config.phoneNumber": `${to}` });
    if (!gateway) {
      return NextResponse.json({ error: 'No SMS gateway configured' }, { status: 500 });
    }

    const config = gateway.config as IViConfig;
    const signature = request.headers.get('x-vi-signature');
    const timestamp = request.headers.get('x-timestamp');
    const data = timestamp + body;
    const expectedSignature = crypto
      .createHmac('sha256', config.apiSecret)
      .update(data)
      .digest('base64');
      
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (!body || !from) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const message = new Message({
      from: from,
      to: gateway._id,
      body,
      timestamp: new Date()
    });
    await message.save();

    // Find all users who have this DID assigned and send them the message via websocket
    const targets = await UserModel.find({
      "did": gateway._id
    });

    // targets.forEach(target => {
    //   sendToSocket(target._id.toString(), 'new_sms', {
    //     messageId: message._id,
    //     from: message.from,
    //     to: gateway._id.toString(),
    //     body: message.body,
    //     timestamp: message.timestamp    
    //   });
    // });

    console.log(`Received SMS from ${from} to ${to}: ${body}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
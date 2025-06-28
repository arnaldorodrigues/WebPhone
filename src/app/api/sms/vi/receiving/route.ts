import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { SmsGateway, IViConfig } from '@/models/SmsGateway';
import Message from '@/models/Message';
import UserModel from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    console.log("+++++++++++++++++++++ request", request);
    const formData = await request.formData();
    const from = formData.get('msisdn')?.toString();
    const to = formData.get('to')?.toString();
    const body = formData.get('text')?.toString() || '';

    if (!body || !from) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    await connectDB();

    const gateway = await SmsGateway.findOne({
      type: 'vi',
      "config.phoneNumber": `${to}`
    });
    if (!gateway) {
      return NextResponse.json(
        { error: 'No SMS gateway configured' },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log(`Received SMS from ${from} to ${to}: ${body}`);

    const message = new Message({
      from: from,
      to: gateway._id,
      body,
      timestamp: new Date()
    });
    await message.save();

    const targetUsers = await UserModel.find({
      "did": gateway._id
    });

    if (!targetUsers || targetUsers.length < 1) {
      return NextResponse.json(
        { error: "No Users" },
        { status: 404 }
      );
    }

    const targets = targetUsers.map((target: any) => target._id);

    await fetch('http://localhost:8080/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targets: targets,
        data: {
          type: 'new_sms',
          messageId: message._id,
          from: message.from,
          body: message.body,
          timestamp: message.timestamp
        },
      })
    });

    return NextResponse.json(
      { message: "Successfully Received" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
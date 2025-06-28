import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { SmsGateway, IViConfig } from '@/models/SmsGateway';
import Message from '@/models/Message';
import UserModel from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    console.log("++++++++++++++++", contentType);

    let body: any;

    if (contentType.includes('application/json')) {
      body = await request.json(); // JSON POST
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries()); // Convert FormData to object
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
    }

    console.log("+++++++++++++++++++++ body", body);

    const { from, to, message } = body;

    if (!message || !from) {
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
    const data = timestamp + message;
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

    console.log(`Received SMS from ${from} to ${to}: ${message}`);

    const newMessage = new Message({
      from: from,
      to: gateway._id,
      message,
      timestamp: new Date()
    });
    await newMessage.save();

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
          messageId: newMessage._id,
          from: newMessage.from,
          body: newMessage.body,
          timestamp: newMessage.timestamp
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
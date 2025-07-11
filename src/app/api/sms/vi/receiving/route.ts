import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import UserModel from "@/models/User";
import SmsGatewayModel from '@/models/SmsGateway';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let body: any;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries()); // Convert FormData to object
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
    }

    const { from, to, text } = body;

    if (!text || !from) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    await connectDB();

    const fromNumber = "+" + from;
    const toNumber = "+" + to;

    const gateway = await SmsGatewayModel.findOne({
      type: 'vi',
      "config.phoneNumber": `${toNumber.replace('+1', '')}`
    });
    if (!gateway) {
      return NextResponse.json(
        { error: 'No SMS gateway configured' },
        { status: 404 }
      );
    }

    console.log(`Received SMS from ${from} to ${to}: ${text}`);

    const newMessage = new Message({
      from: fromNumber.replace('+1', ''),
      to: gateway._id,
      body: text,
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
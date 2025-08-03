export const runtime = 'nodejs';

import _Message from "@/models/Message";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import SmsGatewayModel from "@/models/SmsGateway";
import MessageModel from "@/models/Message";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From')?.toString();
    const to = formData.get('To')?.toString();
    const body = formData.get('Body')?.toString();

    if (!body || !from) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 404 }
      );
    }

    await connectDB();

    const gateway = await SmsGatewayModel.findOne({
      type: 'signalwire',
      "didNumber": `${to?.replace('+1', '')}`
    });
    if (!gateway) {
      return NextResponse.json(
        { error: "No SMS Gateway configured" },
        { status: 404 }
      );
    }

    const message = new MessageModel({
      from: from.replace('+1', ''),
      to: gateway._id,
      body,
      timestamp: new Date()
    });
    await message.save();

    const targetUsers = await UserModel.find({
      "smsGateway": gateway._id
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

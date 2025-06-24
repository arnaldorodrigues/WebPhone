import { ISignalwireConfig, SmsGateway } from "@/models/SmsGateway";
import Message from "@/models/Message";

import { NextRequest, NextResponse } from "next/server";
// @ts-ignore: SignalWire types export issue
import { RestClient } from "@signalwire/compatibility-api";
import connectDB  from "@/lib/mongodb";

export async function POST  (request: NextRequest) {
  try {
    const { body, from, to } = await request.json();

    await connectDB();
    
    const gateway = await SmsGateway.findOne({ type: 'signalwire', "config.phoneNumber": `${to.replace('+1', '')}` });
    if (!gateway) {
      return NextResponse.json({ error: 'No SMS gateway configured' }, { status: 500 });
    }

    const config = gateway.config as ISignalwireConfig;
    if (!body || !from) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const message = new Message({
      from: from.replace('+1', ''),
      to: gateway._id,
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
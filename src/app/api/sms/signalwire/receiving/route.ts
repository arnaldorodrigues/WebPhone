export const runtime = 'nodejs';

import { ISignalwireConfig, SmsGateway } from "@/models/SmsGateway";
import Message from "@/models/Message";
import { sendToSocket } from "@/utils/backend-websocket";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From')?.toString();
    const to = formData.get('To')?.toString();
    const message = formData.get('Body')?.toString();

    await connectDB();

    await fetch('http://localhost:8080/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'applicatioin/json' },
      body: JSON.stringify({
        type: 'sms-received',
        data: { from, to, message },
      })
    })

    // console.log("++++++++++++++++ Get Config")

    // const config = gateway.config as ISignalwireConfig;
    // if (!body || !from) {
    //   return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    // }

    // console.log("++++++++++++++++ Create Message")

    // const message = new Message({
    //   from: from.replace('+1', ''),
    //   to: gateway._id,
    //   body,
    //   timestamp: new Date()
    // });
    // await message.save();

    // console.log("++++++++++++++++ Get Targets")

    // const targets = await UserModel.find({
    //   "did": gateway._id
    // });

    // // targets.forEach(target => {
    // //   sendToSocket(target._id.toString(), 'new_sms', {
    // //     messageId: message._id,
    // //     from: message.from,
    // //     to: gateway._id.toString(),
    // //     body: message.body,
    // //     timestamp: message.timestamp    
    // //   });
    // // }); 

    // console.log("++++++++++++++++ SendtoSocket")

    // sendToSocket("684ddafe70074dddcc978244", 'new_sms', {
    //   messageId: message._id,
    //   from: message.from,
    //   to: gateway._id.toString(),
    //   body: message.body,
    //   timestamp: message.timestamp    
    // });

    // @ts-ignore
    const { RestClient } = await import("@signalwire/compatibility-api");

    const response = new RestClient.LaML.MessagingResponse();
    response.message(message);

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
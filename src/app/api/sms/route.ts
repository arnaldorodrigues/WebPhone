import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import Message from '@/models/Message';
import { _parse_token } from '@/utils/auth';
import { sendSignalWireSMS } from './signalwire/sending/route';
import { sendViSMS } from './vi/sending/route';
import { SmsGateway } from '@/models/SmsGateway';

export async function POST (request: NextRequest) {
  try {
    const body = await request.json();
  
    const to = body.to;
    const messageBody = body.messageBody;

    connectDB();

    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);
    const user = await UserModel.findById(token._id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.did || user.did === "") {
      return NextResponse.json({error: 'You have no DID number'}, {status: 404});
    }

    const smsGateway = await SmsGateway.findById(user.did);

    if (!smsGateway) {
      return NextResponse.json({error: "No SMS Gateway"}, {status: 404})
    }

    const result = smsGateway.type === "signalwire" ? await sendSignalWireSMS(user.did, to, messageBody) : (smsGateway.type === "vi" ? await sendViSMS(user.did, to, messageBody) : {success:false, data:"Invalid SMS Gateway Type", status: 400});
    
    if (!result.success) {
      return NextResponse.json(
        {error:result.data}, {status:result.status}
      )
    }

    const message = new Message({
      from: user.did,
      to,
      body: messageBody,
      timestamp: new Date()
    });

    await message.save();

    return NextResponse.json({
      success:true, data: result.data
    });

  } catch(error) {
    return NextResponse.json({ error: (error as Error).message}, {status: 500});
  }
}
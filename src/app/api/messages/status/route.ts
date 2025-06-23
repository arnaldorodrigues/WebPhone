import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import UserModel from "@/models/User";
import connectDB from "@/lib/mongodb";
import { _parse_token } from "@/utils/auth";
import { SmsGateway } from '@/models/SmsGateway';

async function getGatewayPhoneNumber() {
  const gateway = await SmsGateway.findOne({ type: 'signalwire' });
  if (!gateway) {
    throw new Error('No SMS gateway configured');
  }
  return gateway.phoneNumber;
}

export async function GET(request: NextRequest) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);
    await connectDB();
    
    const contact = request.nextUrl.searchParams.get('contact');
    const status = request.nextUrl.searchParams.get('status');

    if (!contact || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const gatewayNumber = await getGatewayPhoneNumber();
    const to = contact.startsWith('+') ? gatewayNumber : token._id;
    
    const messages = await Message.find({
      from: contact,
      to,
      status
    });

    return NextResponse.json({ success: true, count: messages.length });
  } catch (error) {
    console.error('Error getting messages status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get messages status' },
      { status: 500 }
    );
  }
}
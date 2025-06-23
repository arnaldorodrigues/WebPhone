import { NextRequest, NextResponse } from "next/server";
import { SMSService } from "@/services/sms-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, type, from } = body;

    if (!to || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['signalwire', 'vi'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid gateway type' },
        { status: 400 }
      );
    }

    const result = await SMSService.sendSMS({
      to,
      message,
      type: type as 'signalwire' | 'vi',
      from
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { SMSService } from "@/services/sms-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;

    if (!['signalwire', 'vi'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid gateway type' },
        { status: 400 }
      );
    }

    // Get the gateway to verify the request
    const gateway = await SMSService.getGatewayByType(type as 'signalwire' | 'vi');
    if (!gateway) {
      return NextResponse.json(
        { error: 'Gateway not configured' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Handle different webhook formats for each provider
    let smsData;
    if (type === 'signalwire') {
      smsData = {
        messageId: body.MessageSid,
        from: body.From,
        to: body.To,
        message: body.Body,
        status: body.MessageStatus,
        timestamp: new Date().toISOString()
      };
    } else {
      // VI/Sangoma format
      smsData = {
        messageId: body.id,
        from: body.from,
        to: body.to,
        message: body.message,
        status: body.status,
        timestamp: body.timestamp || new Date().toISOString()
      };
    }

    // Here you can process the SMS data:
    // - Save to database
    // - Trigger notifications
    // - Forward to other services
    console.log('Received SMS webhook:', smsData);

    // Return appropriate response format for each provider
    if (type === 'signalwire') {
      return NextResponse.json({ received: true });
    } else {
      return NextResponse.json({ status: 'success' });
    }
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SmsGatewayModel from '@/models/SmsGateway';

type Context = {
  params: Promise<{ type: string }>;
};

export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    await connectDB();

    const { type } = await context.params;

    if (!['signalwire', 'vi'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid gateway type' },
        { status: 400 }
      );
    }

    const gateway = await SmsGatewayModel.findOne({ type });
    if (!gateway) {
      return NextResponse.json(
        { success: false, error: `No ${type} gateway configured` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      phoneNumber: gateway?.config?.phoneNumber
    });
  } catch (error) {
    console.error('Error fetching gateway phone number:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
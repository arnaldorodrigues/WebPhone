import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SmsGateway } from "@/models/SmsGateway";

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    await connectToDatabase();
    const { type } = params;

    if (!type || !['signalwire', 'vi'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid gateway type' },
        { status: 400 }
      );
    }

    const gateway = await SmsGateway.findOne({ type });
    
    if (!gateway) {
      return NextResponse.json(
        { error: `No ${type} gateway configured` },
        { status: 404 }
      );
    }

    return NextResponse.json(gateway);
  } catch (error) {
    console.error('Error fetching gateway:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
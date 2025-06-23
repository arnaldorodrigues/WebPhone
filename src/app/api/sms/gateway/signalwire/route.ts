import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SmsGateway } from '@/models/SmsGateway';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const gateway = await SmsGateway.findOne({ type: 'signalwire' });
    if (!gateway) {
      return NextResponse.json({ success: false, error: 'No SMS gateway configured' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      phoneNumber: gateway.phoneNumber
    });
  } catch (error) {
    console.error('Error fetching gateway:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gateway configuration' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ISignalwireConfig, ISmsGateway, IViConfig, SmsGateway } from "@/models/SmsGateway";

const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber.trim()) {
    return "Phone number is required";
  }

  if (!/^\+?\d+$/.test(phoneNumber)) {
    return "Phone number must contain only digits";
  }

  if (phoneNumber.length < 10 || phoneNumber.length > 15) {
    return "Phone number must be between 10 and 15 digits";
  }
  return null;
};

export async function GET() {
  try {
    await connectDB();

    const gateways = await SmsGateway.find().sort({ createdAt: -1 });
    return NextResponse.json(gateways);
  } catch (error) {
    console.error('Error fetching SMS gateways:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const validateSMSGatewayInput = async (data : ISmsGateway) => {
  await connectDB();

  if (!data.type || !data.config) return 'Type and configuration are required';

  if (!['signalwire', 'vi'].includes(data.type)) return 'Invalid gateway type';

  if (data.type === 'signalwire') {
    const { phoneNumber, projectId, authToken, spaceUrl } = (data.config as ISignalwireConfig);
    
    if (!phoneNumber || !projectId || !authToken || !spaceUrl) return 'All SignalWire configuration fields are required';

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) return phoneError;

    if (projectId.length < 3) return 'Project ID must be at least 3 characters';

    if (authToken.length < 8) return 'Auth Token must be at least 8 characters';

    if (!/^[a-zA-Z0-9-]+\.signalwire\.com$/.test(spaceUrl)) return 'Invalid SignalWire space URL format';

    const existingSignalwire = await SmsGateway.findOne({
      type: 'signalwire',
      'config.phoneNumber': phoneNumber
    });

    if (existingSignalwire) return 'SignalWire phone number already exists';

  } else if (data.type === 'vi') {
    const { phoneNumber, apiKey, apiSecret } = (data.config as IViConfig);
    
    if (!phoneNumber || !apiKey || !apiSecret) return 'All VI configuration fields are required';

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) return phoneError;

    if (apiKey.length < 4) return 'API Key must be at least 4 characters';

    if (apiSecret.length < 4) return 'API Secret must be at least 4 characters';

    const existingVi = await SmsGateway.findOne({
      type: 'vi',
      'config.phoneNumber': phoneNumber
    });

    if (existingVi) return 'VI phone number already exists';
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();

    const error = validateSMSGatewayInput(data);
    if (!error){
      NextResponse.json({error}, {status:400})
    }

    const gateway = await SmsGateway.create(data);
    
    return NextResponse.json(gateway);

  } catch (error) {
    console.error('Error creating SMS gateway:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Gateway ID is required' },
        { status: 400 }
      );
    }

    const error = validateSMSGatewayInput(data);
    if (!error){
      NextResponse.json({error}, {status:400})
    }

    const gateway = await SmsGateway.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!gateway) {
      return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
    }

    return NextResponse.json(gateway);
  } catch (error) {
    console.error('Error updating SMS gateway:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const gateway = await SmsGateway.findByIdAndDelete(id);

    if (!gateway) {
      return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Gateway deleted successfully' });
  } catch (error) {
    console.error('Error deleting SMS gateway:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
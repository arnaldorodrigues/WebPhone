import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SmsGateway } from "@/models/SmsGateway";

const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber.trim()) {
    return "Phone number is required";
  }
  // Allow digits and optional + at the start
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
    await connectToDatabase();

    const gateways = await SmsGateway.find().sort({ createdAt: -1 });
    return NextResponse.json(gateways);
  } catch (error) {
    console.error('Error fetching SMS gateways:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const data = await request.json();

    // Validate required fields
    if (!data.type || !data.config) {
      return NextResponse.json(
        { error: 'Type and configuration are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['signalwire', 'vi'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid gateway type' },
        { status: 400 }
      );
    }

    // Validate config based on type
    if (data.type === 'signalwire') {
      const { phoneNumber, projectId, authToken, spaceUrl } = data.config;
      
      // Validate required fields
      if (!phoneNumber || !projectId || !authToken || !spaceUrl) {
        return NextResponse.json(
          { error: 'All SignalWire configuration fields are required' },
          { status: 400 }
        );
      }

      // Validate phone number
      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) {
        return NextResponse.json(
          { error: phoneError },
          { status: 400 }
        );
      }

      // Validate project ID length
      if (projectId.length < 3) {
        return NextResponse.json(
          { error: 'Project ID must be at least 3 characters' },
          { status: 400 }
        );
      }

      // Validate auth token length
      if (authToken.length < 8) {
        return NextResponse.json(
          { error: 'Auth Token must be at least 8 characters' },
          { status: 400 }
        );
      }

      // Validate space URL format
      if (!/^[a-zA-Z0-9-]+\.signalwire\.com$/.test(spaceUrl)) {
        return NextResponse.json(
          { error: 'Invalid SignalWire space URL format' },
          { status: 400 }
        );
      }

      // Check for duplicate phone number
      const existingSignalwire = await SmsGateway.findOne({
        type: 'signalwire',
        'config.phoneNumber': phoneNumber
      });

      if (existingSignalwire) {
        return NextResponse.json(
          { error: 'SignalWire phone number already exists' },
          { status: 400 }
        );
      }
    } else if (data.type === 'vi') {
      const { phoneNumber, apiKey, apiSecret } = data.config;
      
      // Validate required fields
      if (!phoneNumber || !apiKey || !apiSecret) {
        return NextResponse.json(
          { error: 'All VI configuration fields are required' },
          { status: 400 }
        );
      }

      // Validate phone number
      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) {
        return NextResponse.json(
          { error: phoneError },
          { status: 400 }
        );
      }

      // Validate API key length
      if (apiKey.length < 4) {
        return NextResponse.json(
          { error: 'API Key must be at least 4 characters' },
          { status: 400 }
        );
      }

      // Validate API secret length
      if (apiSecret.length < 4) {
        return NextResponse.json(
          { error: 'API Secret must be at least 4 characters' },
          { status: 400 }
        );
      }

      // Check for duplicate phone number
      const existingVi = await SmsGateway.findOne({
        type: 'vi',
        'config.phoneNumber': phoneNumber
      });

      if (existingVi) {
        return NextResponse.json(
          { error: 'VI phone number already exists' },
          { status: 400 }
        );
      }
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
    await connectToDatabase();

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Gateway ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!updateData.type || !updateData.config) {
      return NextResponse.json(
        { error: 'Type and configuration are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['signalwire', 'vi'].includes(updateData.type)) {
      return NextResponse.json(
        { error: 'Invalid gateway type' },
        { status: 400 }
      );
    }

    // Validate config based on type
    if (updateData.type === 'signalwire') {
      const { phoneNumber, projectId, authToken, spaceUrl } = updateData.config;
      
      // Validate required fields
      if (!phoneNumber || !projectId || !authToken || !spaceUrl) {
        return NextResponse.json(
          { error: 'All SignalWire configuration fields are required' },
          { status: 400 }
        );
      }

      // Validate phone number
      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) {
        return NextResponse.json(
          { error: phoneError },
          { status: 400 }
        );
      }

      // Validate project ID length
      if (projectId.length < 3) {
        return NextResponse.json(
          { error: 'Project ID must be at least 3 characters' },
          { status: 400 }
        );
      }

      // Validate auth token length
      if (authToken.length < 4) {
        return NextResponse.json(
          { error: 'Auth Token must be at least 4 characters' },
          { status: 400 }
        );
      }

      // Validate space URL format
      if (!/^[a-zA-Z0-9-]+\.signalwire\.com$/.test(spaceUrl)) {
        return NextResponse.json(
          { error: 'Invalid SignalWire space URL format' },
          { status: 400 }
        );
      }

      // Check for duplicate phone number
      const existingSignalwire = await SmsGateway.findOne({
        _id: { $ne: id },
        type: 'signalwire',
        'config.phoneNumber': phoneNumber
      });

      if (existingSignalwire) {
        return NextResponse.json(
          { error: 'SignalWire phone number already exists' },
          { status: 400 }
        );
      }
    } else if (updateData.type === 'vi') {
      const { phoneNumber, apiKey, apiSecret } = updateData.config;
      
      // Validate required fields
      if (!phoneNumber || !apiKey || !apiSecret) {
        return NextResponse.json(
          { error: 'All VI configuration fields are required' },
          { status: 400 }
        );
      }

      // Validate phone number
      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) {
        return NextResponse.json(
          { error: phoneError },
          { status: 400 }
        );
      }

      // Validate API key length
      if (apiKey.length < 4) {
        return NextResponse.json(
          { error: 'API Key must be at least 4 characters' },
          { status: 400 }
        );
      }

      // Validate API secret length
      if (apiSecret.length < 4) {
        return NextResponse.json(
          { error: 'API Secret must be at least 4 characters' },
          { status: 400 }
        );
      }

      // Check for duplicate phone number
      const existingVi = await SmsGateway.findOne({
        _id: { $ne: id },
        type: 'vi',
        'config.phoneNumber': phoneNumber
      });

      if (existingVi) {
        return NextResponse.json(
          { error: 'VI phone number already exists' },
          { status: 400 }
        );
      }
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
    await connectToDatabase();

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
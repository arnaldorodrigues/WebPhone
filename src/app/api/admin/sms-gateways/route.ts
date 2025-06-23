import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SmsGateway } from "@/models/SmsGateway";
import getServerSession from "next-auth";
// import authOptions from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const data = await request.json();
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
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const data = await request.json();
    const { id, ...updateData } = data;

    const gateway = await SmsGateway.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
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
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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
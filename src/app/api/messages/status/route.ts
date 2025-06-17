import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import UserModel from "@/models/User";
import connectDB from "@/lib/mongodb";
import { _parse_token } from "@/utils/auth";

// Get count of messages with status by contact
export async function GET(request: NextRequest) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);

    await connectDB();
    const user = await UserModel.findById(token._id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const contact = request.nextUrl.searchParams.get('contact');
    const status = request.nextUrl.searchParams.get('status');

    const messages = await Message.find({
      from: contact,
      to: token._id,
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
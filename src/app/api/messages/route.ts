import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { _parse_token, getParsedToken } from '@/utils/auth';
import UserModel from '@/models/User';

// Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = _parse_token(t);
    const url = new URL(request.url);
    const contact = url.searchParams.get('contact');
    
    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact parameter is required' },
        { status: 400 }
      );
    }

    const messages = await Message.find({
      $or: [
        { from: token._id, to: contact },
        { from: contact, to: token._id }
      ]
    })
    .sort({timestamp : 1})
    .limit(100);

    return NextResponse.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Save a new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = _parse_token(t);

    const body = await request.json();
    const { to, messageBody } = body;

    if (!to || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await Message.create({
      from: token._id,
      to,
      body: messageBody,
      // status:"unread",
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save message' },
      { status: 500 }
    );
  }
} 

// Set status
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);

    const user = await UserModel.findById(token._id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { messageId, status } = body;

    console.log("123123123", messageId, status);

    const message = await Message.findByIdAndUpdate(messageId, { status }, { new: true });

    return NextResponse.json({ success: true, message });

  } catch (error) {
    console.error('Error setting viewed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set viewed' },
      { status: 500 }
    );
  }
}
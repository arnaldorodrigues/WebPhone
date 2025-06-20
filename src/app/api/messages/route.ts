import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { _parse_token } from '@/utils/auth';
import UserModel from '@/models/User';

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
    const type = url.searchParams.get('type') || 'chat';
    
    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact parameter is required' },
        { status: 400 }
      );
    }

    const userId = type === 'sms' ? process.env.SIGNALWIRE_PHONE_NUMBER : token._id;
    const messages = await Message.find({
      type,
      $or: [
        { from: userId, to: contact },
        { from: contact, to: userId }
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = _parse_token(t);
    const body = await request.json();
    const { to, messageBody, type = 'chat' } = body;

    if (!to || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const from = type === 'sms' ? process.env.SIGNALWIRE_PHONE_NUMBER : token._id;
    const message = await Message.create({
      from,
      to,
      body: messageBody,
      type,
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

    const message = await Message.findByIdAndUpdate(messageId, { status }, { new: true });

    return NextResponse.json({ success: true, message });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
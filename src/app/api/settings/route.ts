import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Settings } from '@/models/Settings';
import { _parse_token, getParsedToken, getToken } from '@/utils/auth';

// GET /api/settings
export async function GET(request: Request) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);
    await connectDB();
    const settings = await Settings.findOne({ extensionNumber: token.extensionNumber });
    
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/settings
export async function POST(request: Request) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);

    const data = await request.json();
    await connectDB();

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { extensionNumber: token.extensionNumber },
      { ...data, extensionNumber: token.extensionNumber },
      { upsert: true, new: true }
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
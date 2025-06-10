import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Settings } from '@/models/Settings';
import { _parse_token} from '@/utils/auth';
import UserModel from '@/models/User';

// GET /api/settings
export async function GET(request: Request) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);
    await connectDB();

    // Find user and populate settings
    const user = await UserModel.findOne({ email: token.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find settings by email
    let userWithSettings = user;
    const settings = await Settings.findOne({ email: token.email })
      .select('wsServer wsPort wsPath domain sipUsername sipPassword vmNumber sxServer xwPort xwPath xDomain isSTV chatEngine createdAt updatedAt');
    
    userWithSettings = {
      ...user.toObject(),
      ...settings?.toObject()
    };
    
    return NextResponse.json(userWithSettings);
  } catch (error) {
    console.error('Error fetching user with settings:', error);
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

    // Check if settings with same extension number exists
    const existingSettings = await Settings.findOne({ 
      email: { $ne: token.email },
      sipUsername: data.sipUsername 
    });

    if (existingSettings) {
      throw new Error('Extension number already in use');
    }

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { email: token.email },
      { ...data },
      { upsert: true, new: true }
    );

    // Update user and link settings if not already linked
    const user = await UserModel.findOneAndUpdate(
      { email: token.email },
      { 
        name: data.name, 
      },
      { new: true }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
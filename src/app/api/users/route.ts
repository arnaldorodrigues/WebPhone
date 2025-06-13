import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Settings } from '@/models/Settings';
import { _parse_token, getParsedToken } from '@/utils/auth';
import bcrypt from 'bcryptjs';
import { Document } from 'mongoose';

interface UserDocument extends Document {
  _id: any;
  name: string;
  email: string;
  role: string;
  password: string;
  newPassword: string;
  settings?: {
    wsServer: string;
    wsPort: string;
    wsPath: string;
    domain: string;
    sipUsername: string;
    sipPassword: string;
    updatedAt: Date;
  };
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);

    await connectDB();

    // Fetch user and populate settings
    const user = await UserModel.findById(token._id)
      .populate('settings')
      .select('-password')
      .lean();
      
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
      
    const typedUser = user as unknown as UserDocument;
      
    // Format response data
    const formattedUser = {
      id: typedUser._id.toString(),
      name: typedUser.name,
      email: typedUser.email,
      role: typedUser.role,
      status: typedUser.settings ? 'active' : 'inactive',
      createdAt: typedUser.createdAt,
      settings: typedUser.settings ? {
        wsServer: typedUser.settings.wsServer,
        wsPort: typedUser.settings.wsPort,
        wsPath: typedUser.settings.wsPath,
        domain: typedUser.settings.domain,
        sipUsername: typedUser.settings.sipUsername,
        sipPassword: typedUser.settings.sipPassword,
        updatedAt: typedUser.settings.updatedAt,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: formattedUser
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);

    const userData = await request.json();
    await connectDB();

    // Validate required fields
    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Find existing user
    const existingUser = await UserModel.findById(token._id);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check password
    if (userData.password) {
      const isPasswordValid = await bcrypt.compare(userData.password, existingUser.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 400 }
        );
      }
    }

    // Update user data
    const updateData: any = {
      name: userData.name,
      email: userData.email,
      role: userData.role || existingUser.role,
      password: userData.newPassword ? await bcrypt.hash(userData.newPassword, 10) : undefined,
    };

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      existingUser._id,
      updateData,
      { new: true, runValidators: true }
    );

    // Handle settings if provided
    if (userData.settings) {
      // Check for duplicate SIP username
      if (userData.settings.sipUsername) {
        const existingSipUser = await Settings.findOne({
          sipUsername: userData.settings.sipUsername,
          email: { $ne: token.email.toLowerCase() }
        });

        if (existingSipUser) {
          return NextResponse.json(
            { success: false, error: 'SIP Username already exists' },
            { status: 400 }
          );
        }
      }

      const settingsData = {
        email: token.email.toLowerCase(),
        wsServer: userData.settings.wsServer,
        wsPort: userData.settings.wsPort,
        wsPath: userData.settings.wsPath || '/',
        domain: userData.settings.domain,
        sipUsername: userData.settings.sipUsername,
        sipPassword: userData.settings.sipPassword,
      };

      // Find or create settings
      const existingSettings = await Settings.findOne({ 
        email: token.email.toLowerCase() 
      });

      let savedSettings;
      
      if (existingSettings) {
        savedSettings = await Settings.findByIdAndUpdate(
          existingSettings._id,
          settingsData,
          { new: true, runValidators: true }
        );
      } else {
        savedSettings = await Settings.create(settingsData);
      }

      // Link settings to user
      await UserModel.findByIdAndUpdate(updatedUser._id, {
        settings: savedSettings._id
      });
    }

    // Fetch complete updated user data
    const responseUser = await UserModel.findById(updatedUser._id)
      .populate('settings')
      .select('-password')
      .lean();

    if (!responseUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve updated user' },
        { status: 500 }
      );
    }

    const typedResponseUser = responseUser as unknown as UserDocument;

    // Format response data
    const formattedUser = {
      id: typedResponseUser._id.toString(),
      name: typedResponseUser.name,
      email: typedResponseUser.email,
      role: typedResponseUser.role,
      status: typedResponseUser.settings ? 'active' : 'inactive',
      createdAt: typedResponseUser.createdAt,
      settings: typedResponseUser.settings ? {
        wsServer: typedResponseUser.settings.wsServer,
        wsPort: typedResponseUser.settings.wsPort,
        wsPath: typedResponseUser.settings.wsPath,
        domain: typedResponseUser.settings.domain,
        sipUsername: typedResponseUser.settings.sipUsername,
        sipPassword: typedResponseUser.settings.sipPassword,
        updatedAt: typedResponseUser.settings.updatedAt,
      } : null,
    };

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: formattedUser
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 11000) {
      if (error.message.includes('sipUsername')) {
        return NextResponse.json(
          { success: false, error: 'SIP Username already exists' },
          { status: 400 }
        );
      } else if (error.message.includes('email')) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Settings } from '@/models/Settings';
import { User } from '@/types/user';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await UserModel.find({
      role: { $ne: 'admin' }
    })
      .populate('settings')
      .select('-password')
      .lean();

    const allSettings = await Settings.find({}).lean();

    const settingsByEmail = new Map();
    allSettings.forEach(setting => {
      settingsByEmail.set(setting.email, setting);
    });

    const enhancedUsers = users.map((user: any) => {
      const userSettings = user.settings || settingsByEmail.get(user.email);
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: userSettings ? 'active' : 'inactive', 
        createdAt: user.createdAt,
        settings: userSettings ? {
          wsServer: userSettings.wsServer,
          wsPort: userSettings.wsPort,
          wsPath: userSettings.wsPath,
          domain: userSettings.domain,
          sipUsername: userSettings.sipUsername,
          sipPassword: userSettings.sipPassword,
          updatedAt: userSettings.updatedAt,
        } : null,
      };
    });

    const extensionNumbers = allSettings.filter(setting => 
      users.some(user => user.email === setting.email)
    );

    return NextResponse.json({
      success: true,
      data: {
        users: enhancedUsers,
        stats: {
          totalUsers: users.length,
          activeUsers: enhancedUsers.filter(u => u.status === 'active').length,
          adminUsers: enhancedUsers.filter(u => u.role === 'admin').length,
          extensionNumbers: extensionNumbers.length,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData: User & { password?: string } = await request.json();
    await connectDB();
    
    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findOne({ 
      email: userData.email.toLowerCase() 
    });

    let savedUser;
    
    if (existingUser) {
      
      const updateData: any = {
        name: userData.name,
        role: userData.role || 'user',
      };
      
      if (userData.password && userData.password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        updateData.password = hashedPassword;
      }
      
      savedUser = await UserModel.findByIdAndUpdate(
        existingUser._id,
        updateData,
        { new: true, runValidators: true }
      );
      
    } else {
      
      if (!userData.password) {
        return NextResponse.json(
          { success: false, error: 'Password is required for new users' },
          { status: 400 }
        );
      }
      
      if (userData.password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      savedUser = await UserModel.create({
        email: userData.email.toLowerCase(),
        name: userData.name,
        password: hashedPassword,
        role: userData.role || 'user',
      });
    }

    if (userData.settings) {
      if (userData.settings.sipUsername) {
        const existingSipUser = await Settings.findOne({
          sipUsername: userData.settings.sipUsername,
          domain: userData.settings.domain,
          email: { $ne: userData.email.toLowerCase() },
        });

        if (existingSipUser) {
          return NextResponse.json(
            { success: false, error: 'SIP Username already exists. Please choose a different SIP username.' },
            { status: 400 }
          );
        }
      }

      if (userData.settings) {
        if (userData.name) {
          const existingUser = await UserModel.findOne({
            name: userData.name,
            email: { $ne: userData.email.toLowerCase() },
          });
  
          if (existingUser) {
            return NextResponse.json(
              { success: false, error: 'User name already exists. Please choose a different user name.' },
              { status: 400 }
            );
          }
        }
      }
      
      const settingsData = {
        email: userData.email.toLowerCase(),
        wsServer: userData.settings.wsServer,
        wsPort: userData.settings.wsPort,
        wsPath: userData.settings.wsPath || '/',
        domain: userData.settings.domain,
        sipUsername: userData.settings.sipUsername,
        sipPassword: userData.settings.sipPassword,
      };

      const existingSettings = await Settings.findOne({ 
        email: userData.email.toLowerCase() 
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

      if (!savedUser.settings || savedUser.settings.toString() !== savedSettings._id.toString()) {
        await UserModel.findByIdAndUpdate(savedUser._id, {
          settings: savedSettings._id
        });
      }
    }

    const responseUser = await UserModel.findById(savedUser._id)
      .populate('settings')
      .select('-password')
      .lean() as any;

    if (!responseUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve saved user' },
        { status: 500 }
      );
    }

    const formattedUser = {
      id: responseUser._id.toString(),
      name: responseUser.name,
      email: responseUser.email,
      role: responseUser.role,
      status: responseUser.settings ? 'active' : 'inactive',
      createdAt: responseUser.createdAt,
      settings: responseUser.settings ? {
        wsServer: responseUser.settings.wsServer,
        wsPort: responseUser.settings.wsPort,
        wsPath: responseUser.settings.wsPath,
        domain: responseUser.settings.domain,
        sipUsername: responseUser.settings.sipUsername,
        sipPassword: responseUser.settings.sipPassword,
        updatedAt: responseUser.settings.updatedAt,
      } : null,
    };

    return NextResponse.json({
      success: true,
      message: existingUser ? 'User updated successfully' : 'User created successfully',
      data: formattedUser
    });
    
  } catch (error: any) {
    console.error('Error in POST /api/admin/users:', error);
    
    if (error.code === 11000) {
      if (error.message.includes('sipUsername')) {
        return NextResponse.json(
          { success: false, error: 'SIP Username already exists. Please choose a different SIP username.' },
          { status: 400 }
        );
      } else if (error.message.includes('email')) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Duplicate value found' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save user' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await Settings.deleteMany({ email: user.email });

    await UserModel.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User and associated settings deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete user' 
      },
      { status: 500 }
    );
  }
} 
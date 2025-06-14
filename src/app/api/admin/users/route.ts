import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Settings } from '@/models/Settings';
import { User } from '@/types/user';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch all users and populate their settings
    const users = await UserModel.find({
      role: { $ne: 'admin' }
    })
      .populate('settings')
      .select('-password') // Exclude password from response
      .lean();

    // Also fetch settings that might not be linked to users yet
    const allSettings = await Settings.find({}).lean();

    // Create a map of settings by email for easier lookup
    const settingsByEmail = new Map();
    allSettings.forEach(setting => {
      settingsByEmail.set(setting.email, setting);
    });

    // Enhanced user data with additional fields for admin panel
    const enhancedUsers = users.map((user: any) => {
      // Get settings either from populated field or by email lookup
      const userSettings = user.settings || settingsByEmail.get(user.email);
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        // extensionNumber: user.extensionNumber || 'N/A',
        status: userSettings ? 'active' : 'inactive', // Determine status based on settings
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
    
    // Validate required fields
    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: userData.email.toLowerCase() 
    });

    let savedUser;
    
    if (existingUser) {
      // Update existing user
      console.log('Updating existing user:', userData.email);
      
      // Update user data (excluding password unless provided)
      const updateData: any = {
        name: userData.name,
        role: userData.role || 'user',
      };
      
      // Only update password if provided
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
      // Create new user
      console.log('Creating new user:', userData.email);
      
      // Password is required for new users
      if (!userData.password) {
        return NextResponse.json(
          { success: false, error: 'Password is required for new users' },
          { status: 400 }
        );
      }
      
      // Password validation
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

    // Handle settings if provided
    if (userData.settings) {
      // Check for duplicate SIP username before proceeding
      if (userData.settings.sipUsername) {
        const existingSipUser = await Settings.findOne({
          sipUsername: userData.settings.sipUsername,
          email: { $ne: userData.email.toLowerCase() } // Exclude current user's email
        });

        if (existingSipUser) {
          return NextResponse.json(
            { success: false, error: 'SIP Username already exists. Please choose a different SIP username.' },
            { status: 400 }
          );
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

      // Check if settings already exist for this user
      const existingSettings = await Settings.findOne({ 
        email: userData.email.toLowerCase() 
      });

      let savedSettings;
      
      if (existingSettings) {
        // Update existing settings
        savedSettings = await Settings.findByIdAndUpdate(
          existingSettings._id,
          settingsData,
          { new: true, runValidators: true }
        );
      } else {
        // Create new settings
        savedSettings = await Settings.create(settingsData);
      }

      // Link settings to user if not already linked
      if (!savedUser.settings || savedUser.settings.toString() !== savedSettings._id.toString()) {
        await UserModel.findByIdAndUpdate(savedUser._id, {
          settings: savedSettings._id
        });
      }
    }

    // Fetch the complete user data with populated settings for response
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

    // Format response data
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
    
    // Handle duplicate key errors
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

    // Find the user to get their email for settings cleanup
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete associated settings
    await Settings.deleteMany({ email: user.email });

    // Delete the user
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
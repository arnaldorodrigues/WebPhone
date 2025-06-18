import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Settings } from '@/models/Settings';
import { _parse_token } from '@/utils/auth';
import bcrypt from 'bcryptjs';
import mongoose, { Document, Types } from 'mongoose';

interface Contact {
  id: string;
  name?: string;
  number?: string;
}

interface UserDocument extends Document {
  _id: any;
  name: string;
  email: string;
  role: string;
  password: string;
  newPassword: string;
  contacts?: Contact[];
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

    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('query');
    const count = searchParams.get('count');

    if (searchQuery && count) {
      const limit = parseInt(count);
      
      const users = await UserModel.aggregate([
        {
          $match: { role: "user", _id: { $ne: new mongoose.Types.ObjectId(token._id) } }
        },
        {
          $lookup: {
            from: "settings",
            localField: "settings",
            foreignField: "_id",
            as: "settings"
          }
        },
        {
          $unwind: {
            path: "$settings",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            $or: [
              { name: { $regex: searchQuery, $options: "i" } },
              { "settings.sipUsername": { $regex: searchQuery, $options: "i" } }
            ]
          }
        },
        {
          $limit: parseInt(count)
        }
      ]);
      
      const candidates = users.map((user: any) => ({
        id: user._id.toString(),
        name: user.name,
        number: user.settings?.sipUsername || ''
      }));

      return NextResponse.json({
        success: true,
        data: candidates
      });
    }

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
      
    const formattedUser: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      createdAt: Date;
      contacts: Contact[];
      settings: {
        wsServer: string;
        wsPort: string;
        wsPath: string;
        domain: string;
        sipUsername: string;
        sipPassword: string;
        updatedAt: Date;
      } | null;
    } = {
      id: typedUser._id.toString(),
      name: typedUser.name,
      email: typedUser.email,
      role: typedUser.role,
      status: typedUser.settings ? 'active' : 'inactive',
      createdAt: typedUser.createdAt,
      contacts: [],
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

    for (let i = 0; i < (typedUser.contacts?.length || 0); i++) {
      const contact = await UserModel.findById(typedUser?.contacts?.[i])
        .populate('settings')
        .select('name settings')
        .lean() as unknown as {
          _id: Types.ObjectId;
          name: string;
          settings?: {
            sipUsername: string;
          };
        };

      if (contact) {
        const newContact: Contact = {
          id: contact._id.toString(),
          name: contact.name || '',
          number: contact.settings?.sipUsername || '',
        };
        formattedUser.contacts.push(newContact);
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedUser
    });

  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
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

    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findById(token._id);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (userData.password) {
      const isPasswordValid = await bcrypt.compare(userData.password, existingUser.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      name: userData.name,
      email: userData.email,
      role: userData.role || existingUser.role,
      password: userData.newPassword ? await bcrypt.hash(userData.newPassword, 10) : undefined,
    };
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      existingUser._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (userData.settings) {
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

      await UserModel.findByIdAndUpdate(updatedUser._id, {
        settings: savedSettings._id
      });
    }

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

    const formattedUser: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      createdAt: Date;
      contacts: Contact[];
      settings: {
        wsServer: string;
        wsPort: string;
        wsPath: string;
        domain: string;
        sipUsername: string;
        sipPassword: string;
        updatedAt: Date;
      } | null;
    } = {
      id: typedResponseUser._id.toString(),
      name: typedResponseUser.name,
      email: typedResponseUser.email,
      role: typedResponseUser.role,
      status: typedResponseUser.settings ? 'active' : 'inactive',
      createdAt: typedResponseUser.createdAt,
      contacts: typedResponseUser.contacts || [],
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

export async function PUT(request: NextRequest) {
  try {
    const t = request.headers.get('cookies');

    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = _parse_token(t);
    const { action, number } = await request.json();

    await connectDB();

    if (!action || !number) {
      return NextResponse.json(
        { success: false, error: 'Action and contact data are required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(token._id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const contact = (await UserModel.aggregate([
      {
        $lookup: {
          from: "settings", 
          localField: "settings",
          foreignField: "_id",
          as: "settings"
        }
      },
      { $unwind: "$settings" },
      { $match: { "settings.sipUsername": number } }
    ]))[0] as unknown as {
      _id: Types.ObjectId;
      name: string;
      settings: {
        sipUsername: string;
      };
    };

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "That number not found"},
        { status: 404}
      )
    }

    if (action === 'add') {
      const contactExists = user.contacts.some(
        (c: Types.ObjectId) => c.toString() === contact._id.toString()
      );
      
      if (contactExists) {
        return NextResponse.json(
          { success: false, error: 'Contact already exists' },
          { status: 400 }
        );
      }
      
      if(contact && contact._id) user.contacts.push(contact._id);
    } else if (action === 'remove') {
      user.contacts = user.contacts.filter(
        (c: Types.ObjectId) => c.toString() !== contact._id.toString()
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    await user.save();

    const updatedUser = await UserModel.findById(user._id)
      .populate('settings')
      .select('-password')
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve updated user' },
        { status: 500 }
      );
    }

    const typedUser = updatedUser as unknown as UserDocument;

    const formattedUser: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      createdAt: Date;
      contacts: Contact[];
      settings: {
        wsServer: string;
        wsPort: string;
        wsPath: string;
        domain: string;
        sipUsername: string;
        sipPassword: string;
        updatedAt: Date;
      } | null;
    } = {
      id: typedUser._id.toString(),
      name: typedUser.name,
      email: typedUser.email,
      role: typedUser.role,
      status: typedUser.settings ? 'active' : 'inactive',
      createdAt: typedUser.createdAt,
      contacts: typedUser.contacts || [],
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
      message: `Contact ${action}ed successfully`,
      data: formattedUser
    });

  } catch (error) {
    console.error('Error in UPDATE request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
import connectDB from "@/lib/mongodb";
import { withRole } from "@/middleware/authMiddleware";
import SettingModel from "@/models/Setting";
import SipServerModel from "@/models/SipServer";
import UserModel from "@/models/User";
import { UserRole } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const totalUsers = await UserModel.countDocuments();

    const users = await UserModel
      .find({ role: { $ne: UserRole.ADMIN } })
      .skip(skip)
      .limit(limit)
      .populate('settingId')
      .select('-password')
      .lean();

    const transformedUsers = users.map(user => {
      const { settingId, ...rest } = user;
      return {
        ...rest,
        setting: settingId,
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      pagination: {
        totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
});

export const POST = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and Email are required'
        },
        { status: 400 }
      );
    }

    const duplicate = await UserModel.findOne({
      email: body.email,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists'
        },
        { status: 400 }
      );
    }

    const createdUser = await UserModel.create({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
      sipServerId: body.sipServerId,
      smsGatewayId: body.smsGatewayId,
    });

    if (body.sipUsername && body.sipServerId) {
      const sipServer = await SipServerModel.findById(body.sipServerId);

      const extensionDuplicate = await SettingModel.findOne({
        domain: sipServer.domain,
        sipUsername: body.sipUsername
      });

      if (extensionDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Extension Number is already used'
          },
          { status: 400 }
        );
      }

      const createdSetting = await SettingModel.create({
        domain: sipServer.domain,
        wsServer: sipServer.wsServer,
        wsPort: sipServer.wsPort,
        wsPath: sipServer.wsPath,
        sipUsername: body.sipUsername,
        sipPassword: body.sipPassword,
        userId: createdUser._id
      });

      await UserModel.findByIdAndUpdate(createdUser._id,
        {
          settingId: createdSetting._id
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: createdUser
    });
  } catch (error) {
    console.error('Error saving user: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save user'
      },
      { status: 500 }
    );
  }
})

export const PUT = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Id, Name and Email are required'
        },
        { status: 400 }
      );
    }

    const existing = await UserModel.findById(body.id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    const duplicate = await UserModel.findOne({
      email: body.email,
      _id: { $ne: body.id }
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists'
        },
        { status: 400 }
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(body.id,
      {
        email: body.email,
        password: body.password,
        name: body.name,
        role: body.role,
        sipServerId: body.sipServerId,
        smsGatewayId: body.smsGatewayId,
      }
    );

    if (body.sipUsername && body.sipServerId) {
      const sipServer = await SipServerModel.findById(body.sipServerId);

      const extensionDuplicate = await SettingModel.findOne({
        domain: sipServer.domain,
        sipUsername: body.sipUsername
      });

      if (extensionDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Extension Number is already used'
          },
          { status: 400 }
        );
      }

      if (updatedUser.settingId) {
        const existingSetting = await SettingModel.findById(updatedUser.settingId);

        await SettingModel.findByIdAndUpdate(updatedUser.settingId,
          {
            domain: sipServer.domain,
            wsServer: sipServer.wsServer,
            wsPort: sipServer.wsPort,
            wsPath: sipServer.wsPath,
            sipUsername: body.sipUsername ?? existingSetting.sipUsername,
            sipPassword: body.sipPassword ?? existingSetting.sipPassword,
          }
        );
      } else {
        const createdSetting = await SettingModel.create({
          domain: sipServer.domain,
          wsServer: sipServer.wsServer,
          wsPort: sipServer.wsPort,
          wsPath: sipServer.wsPath,
          sipUsername: body.sipUsername,
          sipPassword: body.sipPassword,
          userId: updatedUser._id
        });

        await UserModel.findByIdAndUpdate(updatedUser._id,
          {
            settingId: createdSetting._id
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error saving user: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save user'
      },
      { status: 500 }
    );
  }
})
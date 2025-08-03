import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import SettingModel from '@/models/Setting';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserData } from '@/core/users/model';
import { withAuth } from '@/middleware/authMiddleware';

export const PUT = withAuth(async (req: NextRequest, _context: { params: { id: string } }, _user: any) => {
  try {
    await connectDB();

    const body = await req.json();
    const {
      userId,
      settingId,
      name,
      email,
      domain,
      sipUsername,
      sipPassword,
      password,
      newPassword
    } = body;

    if (!mongoose.Types.ObjectId.isValid(settingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid setting Id" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user Id" },
        { status: 400 }
      );
    }

    const userData = await UserModel.findById(userId);
    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const setting = await SettingModel.findOne({
      $and: [
        { _id: settingId },
        { user: userId }
      ]
    });
    if (!setting) {
      return NextResponse.json(
        { success: false, error: "Setting not found" },
        { status: 404 }
      );
    }

    const updatedSetting = await SettingModel.findOneAndUpdate(
      { _id: settingId, user: userId },
      {
        $set: {
          sipPassword: sipPassword,
          sipUsername: sipUsername,
          domain: domain
        }
      },
    );

    if (password && newPassword) {
      const isValidPassword = await bcrypt.compare(password, userData.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await UserModel.findByIdAndUpdate(userId, {
        $set: {
          password: hashedPassword
        }
      })
    }

    const updatedUser = await UserModel
      .findByIdAndUpdate(userId, {
        $set: {
          name: name,
          email: email,
        }
      })
      .populate('smsGateway');

    const updatedUserData: IUserData = {
      id: userId,
      settingId: settingId,
      name: updatedUser.name,
      email: updatedUser.email,
      sipUsername: updatedSetting.sipUsername,
      sipPassword: updatedSetting.sipPassword,
      wsServer: updatedSetting.wsServer,
      wsPort: updatedSetting.wsPort,
      wsPath: updatedSetting.wsPath,
      domain: updatedSetting.domain,
      didNumber: updatedUser.smsGateway?.didNumber ?? "",
      smsType: updatedUser.smsGateway?.type ?? ""
    };

    return NextResponse.json({
      success: true,
      data: updatedUserData
    })
  } catch (error: any) {
    console.error("Error fetching user by ID:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
});
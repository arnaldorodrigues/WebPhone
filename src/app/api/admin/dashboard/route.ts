import connectDB from "@/lib/mongodb";
import { withRole } from "@/middleware/authMiddleware";
import SettingModel from "@/models/Setting";
import UserModel from "@/models/User";
import { UserRole } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(UserRole.ADMIN, async (req: NextRequest, user: any) => {
  try {
    await connectDB();

    const users = await UserModel
      .find({
        role: { $ne: UserRole.ADMIN }
      })
      .select('-password')
      .lean();

    const allSettings = await SettingModel.find({}).lean();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: users.length,
        activeUsers: users.length,
        adminUsers: users.filter(u => u.role === UserRole.ADMIN).length,
        extensionNumbers: allSettings.length,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
});
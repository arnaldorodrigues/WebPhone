import connectDB from "@/lib/mongodb";
import { withRole } from "@/middleware/authMiddleware";
import UserModel from "@/models/User";
import { UserRole } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(UserRole.ADMIN, async (req: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const totalUsers = await UserModel.countDocuments();

    const users = await UserModel.find()
      .skip(skip)
      .limit(limit)
      .populate('settingId')
      .select('-password')
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
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
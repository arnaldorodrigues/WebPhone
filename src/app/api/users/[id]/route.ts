import { IUserData } from "@/core/users/model";
import connectDB from "@/lib/mongodb";
import { withAuth } from "@/middleware/authMiddleware";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req: NextRequest, context: { params: { id: string } }) => {
  try {
    await connectDB();

    const params = await context.params;
    const userId = params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await UserModel
      .findById(userId)
      .populate('setting')
      .populate('smsGateway')
      .select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData: IUserData = {
      id: user._id,
      settingId: user.setting?.id,
      name: user.name,
      email: user.email,
      sipUsername: user.setting?.sipUsername ?? "",
      sipPassword: user.setting?.sipPassword ?? "",
      wsServer: user.setting?.wsServer ?? "",
      wsPort: user.setting?.wsPort ?? "",
      wsPath: user.setting?.wsPath ?? "",
      domain: user.setting?.domain ?? "",
      didNumber: user.smsGateway?.didNumber ?? "",
      smsType: user.smsGateway?.type ?? ""
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
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
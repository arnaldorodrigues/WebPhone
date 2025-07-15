import connectDB from "@/lib/mongodb";
import { withAuth } from "@/middleware/authMiddleware";
import UserModel from "@/models/User";
import { ContactType, UserRole } from "@/types/common";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req: NextRequest, context: { params: any }, user: any) => {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get('search');

    const escapeRegex = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    if (!searchQuery) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const escapedSearchQuery = escapeRegex(searchQuery);
    const currentUserId = new mongoose.Types.ObjectId(user.userId);

    const users = await UserModel.aggregate([
      {
        $match: { role: UserRole.USER, _id: { $ne: currentUserId } }
      },
      {
        $lookup: {
          from: "settings",
          localField: 'setting',
          foreignField: "_id",
          as: "setting"
        }
      },
      {
        $unwind: {
          path: "$setting",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $or: [
            { name: { $regex: escapedSearchQuery, $options: "i" } },
            { "setting.sipUsername": { $regex: escapedSearchQuery, $options: "i" } }
          ]
        }
      }
    ]);

    const candidates = users.map((user: any) => ({
      id: user._id,
      name: user.name,
      sipUsername: user.setting?.sipUsername ?? "",
      contactType: ContactType.WEBRTC
    }));

    return NextResponse.json({
      success: true,
      data: candidates,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
});
import connectDB from "@/lib/mongodb";
import { withRole } from "@/middleware/authMiddleware";
import SmsGatewayModel from "@/models/SmsGateway";
import { UserRole } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const totalCount = await SmsGatewayModel.countDocuments();

    const smsgateways = await SmsGatewayModel.find({})
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: smsgateways,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
})

export const POST = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    const body = await req.json();

    await connectDB();

    if (!body.type || !body.didNumber || !body.config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type and Phone Number are required'
        },
        { status: 400 }
      );
    }

    const duplicate = await SmsGatewayModel.findOne({
      didNumber: body.didNumber
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone Number already exists'
        },
        { status: 400 }
      );
    }

    const newGateway = await SmsGatewayModel.create({
      type: body.type,
      didNumber: body.didNumber,
      config: body.config
    });

    return NextResponse.json({
      success: true,
      data: newGateway
    })
  } catch (error) {
    console.error('Error saving sms gateway: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save gateway'
      },
      { status: 500 }
    );
  }
})

export const PUT = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    const body = await req.json();

    await connectDB();

    if (!body.type || !body.didNumber || !body.config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type and Phone Number are required'
        },
        { status: 400 }
      );
    }

    const existing = await SmsGatewayModel.findById(body.id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMS Gateway is not exist'
        },
        { status: 404 }
      )
    }

    const duplicate = await SmsGatewayModel.findOne({
      didNumber: body.didNumber,
      _id: { $ne: body.id }
    });
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone Number already exists'
        },
        { status: 400 }
      );
    }

    const updatedGateway = await SmsGatewayModel.findByIdAndUpdate(body.id,
      {
        type: body.type,
        didNumber: body.didNumber,
        config: body.config
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedGateway
    })
  } catch (error) {
    console.error('Error saving sms gateway: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save gateway'
      },
      { status: 500 }
    );
  }
})

export const DELETE = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing sms gateway ID'
        },
        { status: 400 }
      )
    }

    await connectDB();

    const deleted = await SmsGatewayModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sms gateway not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sms gateway deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting Sms gateway: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete gateway'
      },
      { status: 500 }
    )
  }
})
import connectDB from "@/lib/mongodb";
import { withRole } from "@/middleware/authMiddleware";
import SipServerModel from "@/models/SipServer";
import { UserRole } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const totalServers = await SipServerModel.countDocuments();

    const sipservers = await SipServerModel.find({})
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: sipservers,
      pagination: {
        totalServers,
        page,
        limit,
        totalPages: Math.ceil(totalServers / limit),
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

    if (!body.domain || !body.wsServer || !body.wsPort) {
      return NextResponse.json(
        {
          success: false,
          error: 'Domain, WS Server and WS Port are required'
        },
        { status: 400 }
      );
    }

    const duplicate = await SipServerModel.findOne({
      domain: body.domain
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Domain already exists'
        },
        { status: 400 }
      );
    }

    const createdServer = await SipServerModel.create({
      domain: body.domain,
      wsServer: body.wsServer,
      wsPort: body.wsPort,
      wsPath: body.wsPath ?? '/',
    })

    return NextResponse.json({
      success: true,
      data: createdServer
    })
  } catch (error) {
    console.error('Error saving sip server: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save server'
      },
      { status: 500 }
    );
  }
})

export const PUT = withRole(UserRole.ADMIN, async (req: NextRequest) => {
  try {
    const body = await req.json();

    await connectDB();

    if (!body.domain || !body.wsServer || !body.wsPort) {
      return NextResponse.json(
        {
          success: false,
          error: 'Domain, WS Server and WS Port are required'
        },
        { status: 400 }
      );
    }

    const existing = await SipServerModel.findById(body.id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'SIP Server is not exist'
        },
        { status: 404 }
      )
    }

    const duplicate = await SipServerModel.findOne({
      domain: body.domain,
      _id: { $ne: body.id }
    });
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Domain already exists'
        },
        { status: 400 }
      );
    }

    const updatedServer = await SipServerModel.findByIdAndUpdate(body.id,
      {
        domain: body.domain,
        wsServer: body.wsServer,
        wsPort: body.wsPort,
        wsPath: body.wsPath ?? '/',
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedServer
    })
  } catch (error) {
    console.error('Error saving sip server: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save server'
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
          error: 'Missing server ID'
        },
        { status: 400 }
      )
    }

    await connectDB();

    const deleted = await SipServerModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'SIP server not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SIP server deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting SIP server: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete server'
      },
      { status: 500 }
    )
  }
})
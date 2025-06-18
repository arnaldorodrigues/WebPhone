import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ServerModel from '@/models/Server';
import { ServerConfig } from '@/types/server-type';

export async function GET() {
  try {
    await connectDB();

    const servers = await ServerModel.find({}).sort({ createdAt: -1 }).lean();

    const formatted = servers.map((srv: any) => ({
      id: srv._id.toString(),
      domain: srv.domain,
      wsServer: srv.wsServer,
      wsPort: srv.wsPort,
      wsPath: srv.wsPath,
      createdAt: srv.createdAt,
      updatedAt: srv.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch servers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Partial<ServerConfig> & { id?: string } = await request.json();

    await connectDB();

    if (!body.domain || !body.wsServer || !body.wsPort) {
      return NextResponse.json({ success: false, error: 'Domain, WS Server and WS Port are required' }, { status: 400 });
    }

    let saved;
    if (body.id) {
      const existing = await ServerModel.findById(body.id);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Server not found' }, { status: 404 });
      }

      const duplicate = await ServerModel.findOne({ domain: body.domain, _id: { $ne: body.id } });
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'Domain already exists' }, { status: 400 });
      }

      saved = await ServerModel.findByIdAndUpdate(body.id, {
        domain: body.domain,
        wsServer: body.wsServer,
        wsPort: body.wsPort,
        wsPath: body.wsPath ?? '/',
        updatedAt: new Date(),
      }, { new: true, runValidators: true });
    } else {
      const duplicate = await ServerModel.findOne({ domain: body.domain });
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'Domain already exists' }, { status: 400 });
      }

      saved = await ServerModel.create({
        domain: body.domain,
        wsServer: body.wsServer,
        wsPort: body.wsPort,
        wsPath: body.wsPath ?? '/',
      });
    }

    const resp = {
      id: saved._id.toString(),
      domain: saved.domain,
      wsServer: saved.wsServer,
      wsPort: saved.wsPort,
      wsPath: saved.wsPath,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };

    return NextResponse.json({ success: true, data: resp });
  } catch (error: any) {
    console.error('Error saving server:', error);

    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Domain already exists' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Failed to save server' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Server id is required' }, { status: 400 });
    }

    await connectDB();

    await ServerModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Server deleted' });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete server' }, { status: 500 });
  }
} 
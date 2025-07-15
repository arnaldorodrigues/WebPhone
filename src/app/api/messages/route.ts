import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { isValidObjectId } from 'mongoose';
import SmsGatewayModel from '@/models/SmsGateway';
import { withAuth } from '@/middleware/authMiddleware';
import MessageModel from '@/models/Message';
import { ContactType } from '@/types/common';

export const GET = withAuth(async (req: NextRequest, context: { params: any }, user: any) => {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const contactId = searchParams.get('contact');
    const contactType = searchParams.get('contactType');

    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact not found'
        },
        {
          status: 400
        }
      );
    }

    const recon = !isValidObjectId(contactId)
      ? `${contactId}`
      : contactId;

    if (contactType === ContactType.SMS) {
      const messages = await MessageModel
        .find({
          $or: [
            { from: user.userId, to: recon },
            { from: recon, to: user.userId }
          ]
        })
        .sort({ timeStamp: 1 })
        .limit(100);

      return NextResponse.json({
        success: true,
        data: messages
      });
    } else {
      const smsGateway = user.smsGateway
        ? await SmsGatewayModel.findById(user.smsGateway)
        : null;

      const userId = !isValidObjectId(contactId)
        ? smsGateway?._id
        : user.userId;

      const messages = await MessageModel
        .find({
          $or: [
            { from: userId, to: recon },
            { from: recon, to: userId }
          ]
        })
        .sort({ timeStamp: 1 })
        .limit(100);

      return NextResponse.json({
        success: true,
        data: messages
      });
    }
  } catch (error) {
    console.error('Error fetching messages: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch message'
      },
      { status: 500 }
    );
  }
})
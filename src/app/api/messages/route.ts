import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import SmsGatewayModel, { ISignalWireConfig, IViConfig } from '@/models/SmsGateway';
import { withAuth } from '@/middleware/authMiddleware';
import MessageModel from '@/models/Message';
import { ContactType, SmsGatewayType } from '@/types/common';
import ContactModel from '@/models/Contact';
import { sendSignalWireSMS, sendViSMS } from '@/lib/sendSms';
import UserModel from '@/models/User';

export const GET = withAuth(async (req: NextRequest, _: { params: any }, user: any) => {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const contactId = searchParams.get('contact');

    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact is missing'
        },
        {
          status: 400
        }
      );
    }

    const contact = await ContactModel.findById(new mongoose.Types.ObjectId(contactId));
    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact not found'
        },
        {
          status: 404
        }
      );
    }

    const userData = await UserModel.findById(user.userId);
    if (!userData) {
      return NextResponse.json(
        {
          scuccess: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    let messages: any[] = [];
    let unreadMessages: any[] = [];

    if (contact.contactType === ContactType.WEBRTC) {
      messages = await MessageModel
        .find({
          $or: [
            { from: user.userId, to: contact.contactUser },
            { from: contact.contactUser, to: user.userId }
          ]
        })
        .sort({ timestamp: 1 })
        .limit(100);

      unreadMessages = messages.filter(m => m.from === contact.contactUser && m.status === "unread");
    } else {
      const smsGateway = userData.smsGateway
        ? await SmsGatewayModel.findById(userData.smsGateway)
        : null;

      const senderId = smsGateway?._id ?? user.userId;

      messages = await MessageModel
        .find({
          $or: [
            { from: senderId, to: contact.phoneNumber },
            { from: contact.phoneNumber, to: senderId }
          ]
        })
        .sort({ timestamp: 1 })
        .limit(100);

      unreadMessages = messages.filter(m => m.from === contact.phoneNumber && m.status === "unread");
    }

    if (unreadMessages.length > 0) {
      await MessageModel.updateMany(
        { _id: { $in: unreadMessages.map(m => m._id) } },
        { $set: { status: "read" } }
      );
    }

    return NextResponse.json({
      success: true,
      data: messages
    });
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

export const POST = withAuth(async (req: NextRequest, context: { params: any }, user: any) => {
  try {
    const { to, message } = await req.json();

    const contact = await ContactModel.findById(to);

    if (!contact) {
      return NextResponse.json(
        {
          scuccess: false,
          error: "Contact not found",
        },
        { status: 404 }
      );
    }

    const userData = await UserModel.findById(user.userId);
    if (!userData) {
      return NextResponse.json(
        {
          scuccess: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const createdMessage = await MessageModel.create({
      from: user.userId,
      to: contact.contactType === ContactType.WEBRTC ? contact.contactUser : contact.phoneNumber,
      body: message,
      timestamp: new Date()
    });

    if (contact.contactType === ContactType.SMS) {
      const smsGateway = await SmsGatewayModel.findById(userData.smsGateway);

      if (!smsGateway) {
        return NextResponse.json(
          {
            scuccess: false,
            error: "SmsGateway not found",
          },
          { status: 404 }
        );
      }

      // Send SMS based on gateway type
      if (smsGateway.type === SmsGatewayType.SIGNALWIRE) {
        await sendSignalWireSMS(smsGateway.didNumber, to, message, smsGateway.config as ISignalWireConfig);
      } else {
        await sendViSMS(smsGateway.didNumber, to, message, smsGateway.config as IViConfig);
      }
    }

    return NextResponse.json({
      success: true,
      data: createdMessage
    });

  } catch (error) {
    console.error('Error saving message: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save message'
      },
      { status: 500 }
    );
  }
})
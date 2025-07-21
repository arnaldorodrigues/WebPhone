import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User";
import connectDB from "@/lib/mongodb";
import ContactModel from "@/models/Contact";
import { withAuth } from "@/middleware/authMiddleware";
import mongoose from "mongoose";
import { IContactItem } from "@/core/contacts/model";
import { ContactType, UserRole } from "@/types/common";
import MessageModel from "@/models/Message";

export const GET = withAuth(async (req: NextRequest, context: { params: any }, user: any) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(user.userId);

    const contacts = await ContactModel
      .find({ user: currentUserId });

    const contactsData = await Promise.all(
      contacts.map(async (item) => {
        const isWebRTC = item.contactType === ContactType.WEBRTC;
        const targetId = isWebRTC ? item.contactUser : item.phoneNumber;


        const messages = await MessageModel
            .find({
              $or: [
                { from: currentUserId, to: targetId },
                { from: targetId, to: currentUserId }
              ]
            })
            .sort({ timestamp: 1 });

        const unreadCount = await MessageModel
            .find({ from: targetId, to: currentUserId, status: "unread" })
            .countDocuments();

        return {
          id: item._id,
          name: item.name,
          number: item.sipNumber || item.didNumber,
          unreadCount: unreadCount,
          lastMessageTimeStamp: messages.at(-1)?.timestamp ?? null,
          contactType: item.contactType
        } as IContactItem;
      })
    );

    return NextResponse.json({
      success: true,
      data: contactsData
    });

  } catch (error) {
    console.error('Error fetching contacts: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contacts'
      },
      { status: 500 }
    );
  }
})

export const POST = withAuth(async (req: NextRequest, context: { params: any }, user: any) => {
  try {
    const body = await req.json();

    await connectDB();

    const currentUserId = new mongoose.Types.ObjectId(user.userId);

    const duplicate = body.contactType === ContactType.WEBRTC
      ? await ContactModel.findOne({ user: currentUserId, sipNumber: body.sipNumber })
      : await ContactModel.findOne({ user: currentUserId, phoneNumber: body.phoneNumber })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact already exists'
        },
        { status: 400 }
      );
    }

    const userData = await UserModel
      .findById(currentUserId)
      .populate('setting');

    const users = await UserModel
      .find({ role: UserRole.USER })
      .populate("setting")

    if (body.contactType === ContactType.WEBRTC) {
      const contactUser = body.contactUserId
        ? await UserModel
          .findById(new mongoose.Types.ObjectId(body.contactUserId))
          .populate("setting")
        : users
          .find((user) => user.setting?.sipUsername === body.sipNumber);

      if (!contactUser || contactUser.setting.domain !== userData.setting.domain) {
        return NextResponse.json(
          {
            success: false,
            error: 'Contact user not found'
          },
          { status: 404 }
        );
      }

      const createdContact = await ContactModel.create({
        user: currentUserId,
        name: contactUser.name,
        sipNumber: contactUser.setting.sipUsername,
        contactUser: contactUser._id,
        contactType: ContactType.WEBRTC
      });

      return NextResponse.json({
        success: true,
        data: {
          id: createdContact._id,
          name: createdContact.name,
          number: createdContact.sipNumber,
          contactType: createdContact.contactType
        }
      });
    } else {
      const phoneNumber = body.phoneNumber;

      const createdContact = await ContactModel.create({
        user: currentUserId,
        name: phoneNumber,
        phoneNumber: phoneNumber,
        contactType: ContactType.SMS
      });

      return NextResponse.json({
        success: true,
        data: createdContact
      });
    }
  } catch (error) {
    console.error('Error saving contact: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create contact'
      },
      { status: 500 }
    );
  }
})

export const DELETE = withAuth(async (req: NextRequest, context: { params: any }, user: any) => {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing contact id'
        },
        { status: 400 }
      )
    }

    await connectDB();

    const deleted = await ContactModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting User: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete server'
      },
      { status: 500 }
    )
  }
})
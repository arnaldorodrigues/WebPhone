import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User";
import connectDB from "@/lib/mongodb";
import ContactModel from "@/models/Contact";
import { withAuth } from "@/middleware/authMiddleware";
import mongoose from "mongoose";
import { IContactItem } from "@/core/contacts/model";
import { ContactType } from "@/types/common";

// export async function GET(request: NextRequest) {
//   try {
//     const t = request.headers.get('cookies');

//     if (!t) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = _parse_token(t);
//     await connectDB();

//     const user = await UserModel.findById(token._id);

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     const contacts = await Contact.find({ userId: user._id }).populate('users');

//     return NextResponse.json({ success: true, contacts });

//   } catch (error) {
//     console.error('Error in GET request:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to process request' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {

//     const t = request.headers.get('cookies');

//     if (!t) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = _parse_token(t);
//     await connectDB();

//     const user = await UserModel.findById(token._id);

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     const { contactId } = await request.json()

//     const isDuplicated = await ContactModel.findOne({
//       userId: token._id,
//       contactId
//     });

//     if (isDuplicated) {
//       return NextResponse.json({ success: true, contact: isDuplicated });
//     }

//     const newContact = new ContactModel({
//       userId: token._id,
//       contactId
//     });

//     const res = await newContact.save();

//     return NextResponse.json({ success: true, contact: res });
//   } catch (error) {
//     console.error('Error in POST request:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to process request' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const t = request.headers.get('cookies');

//     if (!t) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = _parse_token(t);
//     await connectDB();

//     const user = await UserModel.findById(token._id);

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     const { contactId } = await request.json();

//     const isOk = await ContactModel.findOneAndDelete({
//       userId: user._id,
//       contactId
//     });

//     if (!isOk) {
//       return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, message: 'Contact deleted successfully' });
//   } catch (error) {
//     console.error('Error in DELETE request:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to process request' },
//       { status: 500 }
//     )
//   }
// }

export const GET = withAuth(async (req: NextRequest, context: { params: any }, user: any) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(user.userId);

    const contacts = await ContactModel
      .find({ user: currentUserId });

    const contactsData: IContactItem[] = contacts.map((item) => ({
      id: item._id,
      name: item.name,
      number: item.sipNumber || item.didNumber,
      contactType: item.contactType
    }));

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
      ? await ContactModel.findOne({ user: currentUserId, sipNumber: body.number })
      : await ContactModel.findOne({ user: currentUserId, phoneNumber: body.number })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact already exists'
        },
        { status: 400 }
      );
    }

    if (body.contactType === ContactType.WEBRTC) {
      const contactUserId = new mongoose.Types.ObjectId(body.contactUserId);

      const contactUser = await UserModel
        .findById(contactUserId)
        .populate("setting");

      console.log("+++++++++++++++++++", contactUser);

      if (!contactUser) {
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
        contactType: ContactType.WEBRTC
      });

      return NextResponse.json({
        success: true,
        data: createdContact
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
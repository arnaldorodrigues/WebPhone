import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User";
import connectDB from "@/lib/mongodb";
import ContactModel from "@/models/Contact";

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
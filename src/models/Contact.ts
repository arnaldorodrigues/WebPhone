import { ContactType, ContactTypeValues } from "@/types/common";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IContact extends Document {
  user: Types.ObjectId;
  name: string;
  sipNumber: string;
  phoneNumber: string;
  contactType: ContactType;
  contactUser?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema: Schema<IContact> = new Schema<IContact>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sipNumber: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    contactType: {
      type: String,
      required: true,
      enum: ContactTypeValues
    },
    contactUser: {
      type: String,
      ref: "User"
    },
  },
  {
    timestamps: true,
  }
);

const ContactModel =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema);

export default ContactModel;
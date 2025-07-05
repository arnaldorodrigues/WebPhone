import mongoose, { Document, Schema, Types } from "mongoose";

export interface IContact extends Document {
  userId: Types.ObjectId;
  contactId: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema: Schema<IContact> = new Schema<IContact>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      required: true,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

const ContactModel = 
  mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema);

export default ContactModel;
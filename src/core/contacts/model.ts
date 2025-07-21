import { ContactType } from "@/types/common";

export interface ICandidateItem {
  id: string;
  name: string;
  sipUsername: string;
  contactType: ContactType;
}

export interface IContactItem {
  id: string;
  name: string;
  number: string;
  unreadCount?: number;
  contactType: ContactType;
  lastMessageTimeStamp: Date;
}

export interface ICreateContactRequest {
  contactUserId?: string;
  contactType: ContactType,
  sipNumber?: string;
  phoneNumber?: string;
}
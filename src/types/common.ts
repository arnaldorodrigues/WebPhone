export enum UserRole {
  ADMIN = "admin",
  USER = 'user'
}

export enum SmsGatewayType {
  SIGNALWIRE = "signalwire",
  VI = "vi",
}
export const SmsGatewayTypeValues = ['signalwire', 'vi'] as const;

export enum MessageStatus {
  DELIVERED = 'delivered',
  FAILED = "failed",
  READ = "read",
  UNREAD = "unread",
}

export type TDropdownOption = {
  value: string;
  label: string;
}

export type TValidationErrors = {
  [key: string]: string;
};

export enum ContactType {
  WEBRTC = "webrtc",
  SMS = "sms"
}
export const ContactTypeValues = ['webrtc', 'sms'] as const;
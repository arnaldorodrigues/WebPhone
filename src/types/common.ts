export enum UserRole {
  ADMIN = "admin",
  USER = 'user'
}

export enum SmsGatewayType {
  SIGNALWIRE = "signalwire",
  VI = "vi",
}
export const SmsGatewayTypeValues = ['signalwire', 'vi'] as const;
// export type SmsGatewayType = typeof SmsGatewayTypeValues[number];

export enum MessageStatus {
  DELIVERED = 'delivered',
  FAILED = "failed",
  READ = "read",
  UNREAD = "unread",
}
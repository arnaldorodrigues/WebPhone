export enum UserRole {
  ADMIN = "admin",
  USER = 'user'
}

export const SmsGatewayTypeValues = ['signalwire', 'vi'] as const;
export type SmsGatewayType = typeof SmsGatewayTypeValues[number];

export enum MessageStatus {
  DELIVERED = 'delivered',
  FAILED = "failed",
  READ = "read",
  UNREAD = "unread",
}
export interface IMessageItem {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
}

export interface ISmsMessage {
  type: string;
  messageId?: string;
  from?: string;
  body?: string;
  timestamp?: Date;
  [key: string]: any;
}
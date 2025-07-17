import { Session } from "sip.js";
import { SessionManager } from "sip.js/lib/platform/web";

export interface ISipMessage {
  id: string;
  body: string;
  from: string;
  timestamp: Date;
}

export enum SipStatus {
  WAIT_REQUEST_CONNECT = "WAIT_REQUEST_CONNECT",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  REGISTERED = "REGISTERED",
  UNREGISTERED = "UNREGISTERED"
}

export enum SessionDirection {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export interface ISipConfig {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  server: string;
  username: string;
  password: string;
  displayName?: string;
}

export type PhoneStateType =
  | "dialing"
  | "sending"
  | "receiving"
  | "calling"
  | "ended"
  | null;

export type SipContextType = {
  sessionManager: SessionManager | null;
  connectAndRegister: (sipConfig: ISipConfig) => void;
  disconnect: () => Promise<void>;
  sipStatus: SipStatus;
  sessions: Record<string, Session>;
  phoneState: PhoneStateType,
  setPhoneState: (state: PhoneStateType) => void;
  extensionNumber: string;
  sessionTimer: SessionTimer,
  sipMessages: Record<string, ISipMessage>,
}

export type Timer = {
  createdAt: Date;
  receivedAt?: Date;
  answeredAt?: Date;
  hangupAt?: Date;
};

export type SessionTimer = Record<string, Timer>;

export interface ISipMessage {
  id: string;
  body: string;
  from: string;
  timestamp: Date;
}
import { Session } from "sip.js";
import { SessionManager } from "sip.js/lib/platform/web";

// export interface SIPProviderOptions {
//   webSocketServer: string;
//   domain: string;
//   refAudioRemote?: HTMLAudioElement;
//   refVideoRemote?: HTMLVideoElement;
// }

export enum CONNECT_STATUS {
  WAIT_REQUEST_CONNECT = "WAIT_REQUEST_CONNECT",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

export enum RegisterStatus {
  UNREGISTERED = "UNREGISTERED",
  REGISTERED = "REGISTERED",
}

export interface SipConfig {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  server: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface IProviderContext {
  sessionManager: SessionManager | null;
  connectAndRegister: (sipConfig: SipConfig) => void;
  disconnect: () => Promise<void>;
  connectStatus: CONNECT_STATUS;
  registerStatus: RegisterStatus;
  sessions: Record<string, Session>;
  sessionTimer: SessionTimer;
}

export enum SessionDirection {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export type Timer = {
  createdAt: Date;
  receivedAt?: Date;
  answeredAt?: Date;
  hangupAt?: Date;
};

export type SessionTimer = Record<string, Timer>;

export enum ErrorMessageLevel1 {
  SIP_PROVIDER = "sip-provider",
}

export enum ErrorMessageLevel2 {
  FAILED_CONNECT_SIP_USER = `Can't connect with SIP Server`,
}

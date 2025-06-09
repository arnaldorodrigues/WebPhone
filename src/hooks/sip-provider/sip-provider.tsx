"use client";

import { ReactNode, useCallback, useRef, useState } from "react";
import React from "react";
import { Session } from "sip.js/lib/api/session";
import { SessionManager, SessionManagerOptions } from "sip.js/lib/platform/web";
import { ErrorMessageLevel1, ErrorMessageLevel2 } from "../../types/sip-type";
import { ProviderContext } from "./sip-provider-context";
import {
  RegisterStatus,
  SipConfig,
  CONNECT_STATUS,
  SessionTimer,
} from "../../types/sip-type";

export const SIPProvider = (props: {
  children: ReactNode;
  mergedSessionManagerOptions?: SessionManagerOptions;
}): React.ReactNode => {
  const { mergedSessionManagerOptions = {}, children } = props;
  const refAudioRemote = useRef<HTMLAudioElement>(null);
  const refVideoRemote = useRef<HTMLVideoElement>(null);

  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [sessionTimer, setSessionTimer] = useState<SessionTimer>({});
  const [sessionManager, setSessionManager] = useState<SessionManager | null>(
    null
  );
  const [connectStatus, setStatus] = useState<CONNECT_STATUS>(
    CONNECT_STATUS.WAIT_REQUEST_CONNECT
  );
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus>(
    RegisterStatus.UNREGISTERED
  );

  const updateSession = useCallback(
    (session: Session) => {
      setSessions((sessions) => ({
        ...sessions,
        [session.id]: session,
      }));
    },
    [setSessions]
  );

  const connectAndRegister = useCallback((sipConfig: SipConfig) => {
    const sessionManager = new SessionManager(
      sipConfig.wsServer + ":" + sipConfig.wsPort + sipConfig.wsPath,
      {
        aor: `sip:${sipConfig.username}@${sipConfig.server}`,
        userAgentOptions: {
          authorizationUsername: sipConfig.username,
          authorizationPassword: sipConfig.password,
        },
        media: {
          constraints: {
            audio: true,
            video: false,
          },
          remote: {
            audio: refAudioRemote.current as HTMLAudioElement,
            // video: refVideoRemote.current as HTMLVideoElement,
          },
        },
        delegate: {
          onCallCreated: (session) => {
            session.stateChange.addListener((state) => {
              console.info(
                ErrorMessageLevel1.SIP_PROVIDER,
                `Session ${session.id} changed to ${state}`
              );
              updateSession(session);
            });
            updateSession(session);
            setSessionTimer((timer) => ({
              ...timer,
              [session.id]: {
                createdAt: new Date(),
              },
            }));
          },
          onCallAnswered: (session) => {
            updateSession(session);
            setSessionTimer((timer) => ({
              ...timer,
              [session.id]: {
                ...(timer[session.id] || {}),
                answeredAt: new Date(),
              },
            }));
          },
          onCallHangup: (session) => {
            updateSession(session);
            setSessionTimer((timer) => ({
              ...timer,
              [session.id]: {
                ...(timer[session.id] || {}),
                hangupAt: new Date(),
              },
            }));
          },
          onCallReceived: (session) => {
            updateSession(session);
            setSessionTimer((timer) => ({
              ...timer,
              [session.id]: {
                ...(timer[session.id] || {}),
                receivedAt: new Date(),
              },
            }));
          },
          onRegistered: () => {
            setRegisterStatus(RegisterStatus.REGISTERED);
          },
          onUnregistered: () => {
            setRegisterStatus(RegisterStatus.UNREGISTERED);
          },
          onServerConnect() {
            setStatus(CONNECT_STATUS.CONNECTED);
            sessionManager.register();
          },
          onServerDisconnect(error) {
            console.error(
              ErrorMessageLevel1.SIP_PROVIDER,
              ErrorMessageLevel2.FAILED_CONNECT_SIP_USER,
              error
            );
            setStatus(CONNECT_STATUS.DISCONNECTED);
          },
        },
        ...mergedSessionManagerOptions,
      }
    );
    setSessionManager(sessionManager);
    sessionManager.connect();
  }, []);

  return (
    <>
      <ProviderContext.Provider
        value={{
          connectAndRegister,
          sessionManager,
          connectStatus,
          registerStatus,
          sessions,
          sessionTimer,
        }}
      >
        {children}
      </ProviderContext.Provider>
      <audio ref={refAudioRemote} />
      {/* <video ref={refVideoRemote} /> */}
    </>
  );
};

"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
import { useUserData } from "../use-userdata";
import { addContact } from "@/lib/contact-action";
import { useNotification } from "@/contexts/notification-context";

interface SipMessage {
  id: string;
  body: string;
  from: string;
  timestamp: Date;
}

export const SIPProvider = (props: {
  children: ReactNode;
  mergedSessionManagerOptions?: SessionManagerOptions;
}): React.ReactNode => {
  const { mergedSessionManagerOptions = {}, children } = props;
  const refAudioRemote = useRef<HTMLAudioElement>(null);
  const refVideoRemote = useRef<HTMLVideoElement>(null);
  const { showNotification } = useNotification();

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
  const [messages, setMessages] = useState<Record<string, SipMessage>>({});
  const { userData, refreshUserData } = useUserData();

  const updateSession = useCallback(
    (session: Session) => {
      setSessions((sessions) => ({
        ...sessions,
        [session.id]: session,
      }));
    },
    [setSessions]
  );

  const addMessage = useCallback(
    (message: SipMessage) => {
      setMessages((messages) => ({
        ...messages,
        [message.id]: message,
      }));
    },
    [setMessages]
  );

  const clearMessages = useCallback(() => {
    setMessages({});
  }, [setMessages]);

  const connectAndRegister = useCallback(
    (sipConfig: SipConfig) => {
      const sessionManager = new SessionManager(
        `${sipConfig?.wsServer || ""}:${sipConfig?.wsPort || ""}${
          sipConfig?.wsPath || ""
        }`,
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
              showNotification(
                "Call Status",
                "Call connected successfully",
                "success"
              );
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
              showNotification("Call Status", "Call has ended", "info");
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
              const caller = session.remoteIdentity.uri.user;
              showNotification("Incoming Call", `Call from ${caller}`, "info");
            },
            onRegistered: () => {
              setRegisterStatus(RegisterStatus.REGISTERED);
              showNotification(
                "Connection Status",
                "Successfully connected to SIP server",
                "success"
              );
            },
            onUnregistered: () => {
              setRegisterStatus(RegisterStatus.UNREGISTERED);
              showNotification(
                "Connection Status",
                "Disconnected from SIP server",
                "warning"
              );
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
              showNotification(
                "Disconnected",
                "Disconnected from SIP server",
                "warning"
              );
            },
            onMessageReceived: (message) => {
              const newMessage: SipMessage = {
                id: Date.now().toString(),
                body: message.request.body || "",
                from: message.request.from?.uri?.user || "unknown",
                timestamp: new Date(),
              };
              addMessage(newMessage);
              showNotification(
                "New Message",
                `Message received from ${newMessage.from}`,
                "info"
              );
            },
          },
          ...mergedSessionManagerOptions,
        }
      );
      setSessionManager(sessionManager);
      sessionManager.connect();
    },
    [showNotification]
  );

  const disconnect = useCallback(async () => {
    if (sessionManager) {
      try {
        if (registerStatus === RegisterStatus.REGISTERED) {
          await sessionManager.unregister();
        }

        await sessionManager.disconnect();

        setSessionManager(null);

        setSessions({});
        setSessionTimer({});
        clearMessages();

        setStatus(CONNECT_STATUS.WAIT_REQUEST_CONNECT);
        setRegisterStatus(RegisterStatus.UNREGISTERED);
      } catch (error) {
        console.error("SIP Provider: Error during disconnect:", error);
        setSessionManager(null);
        setSessions({});
        setSessionTimer({});
        clearMessages();
        setStatus(CONNECT_STATUS.DISCONNECTED);
        setRegisterStatus(RegisterStatus.UNREGISTERED);
      }
    }
  }, [sessionManager, registerStatus, clearMessages]);

  useEffect(() => {
    const processNewContacts = async () => {
      let newContacts: string[] = [];
      const keys = Object.keys(messages);

      for (let i = 0; i < keys.length; i++) {
        if (newContacts.includes(messages[keys[i]].from)) {
          continue;
        }
        if (
          userData.contacts.some(
            (contact) => contact.number === messages[keys[i]].from
          )
        ) {
          continue;
        }
        newContacts.push(messages[keys[i]].from);
      }

      await Promise.all(
        newContacts.map((contactId) =>
          addContact({
            id: "",
            name: "",
            number: contactId,
          })
        )
      );

      refreshUserData();
    };

    processNewContacts();
  }, [messages, refreshUserData]);

  return (
    <>
      <ProviderContext.Provider
        value={{
          connectAndRegister,
          disconnect,
          sessionManager,
          connectStatus,
          registerStatus,
          sessions,
          sessionTimer,
          messages,
          clearMessages,
        }}
      >
        {children}
      </ProviderContext.Provider>
      <audio ref={refAudioRemote} />
    </>
  );
};

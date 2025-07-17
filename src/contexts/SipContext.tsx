import { SessionTimer, SipConfig, SipMessage, SipStatus, SipContextType, PhoneStateType, SessionDirection, Timer } from "@/types/siptypes";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Inviter, Session } from "sip.js";
import { SessionManager, SessionManagerOptions } from "sip.js/lib/platform/web";
import { useNotification } from "./NotificationContext";

export const SipContext = createContext<SipContextType | undefined>(undefined);

export const SipProvider = ({
  children,
  mergedSessionManagerOptions
}: {
  children: React.ReactNode,
  mergedSessionManagerOptions?: SessionManagerOptions;
}) => {
  const refAudioRemote = useRef<HTMLAudioElement>(null);

  const { showNotification } = useNotification();

  const [sessionManager, setSessionManager] = useState<SessionManager | null>(null);
  const [sipStatus, setSipStatus] = useState<SipStatus>(SipStatus.UNREGISTERED);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [sessionTimer, setSessionTimer] = useState<SessionTimer>({});
  const [messages, setMessages] = useState<Record<string, SipMessage>>({});
  const [phoneState, setPhoneState] = useState<PhoneStateType>(null);
  const [extensionNumber, setExtensionNumber] = useState<string>("");

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

  const updateSession = useCallback(    
    (session: Session) => {
      setSessions((prev) => ({
        ...prev,
        [session.id]: session,
      }));
    },
    [setSessions]
  );

  const connectAndRegister = (sipConfig: SipConfig) => {
    const sessionManager = new SessionManager(
      `${sipConfig?.wsServer || ""}:${sipConfig?.wsPort || ""}${sipConfig?.wsPath || ""
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
                "sip-provider",
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
            setSipStatus(SipStatus.REGISTERED);
            showNotification(
              "Connection Status",
              "Successfully connected to SIP server",
              "success"
            );
          },
          onUnregistered: () => {
            setSipStatus(SipStatus.UNREGISTERED);
            showNotification(
              "Connection Status",
              "Disconnected from SIP server",
              "warning"
            );
          },
          onServerConnect() {
            setSipStatus(SipStatus.CONNECTED);
            sessionManager.register();
          },
          onServerDisconnect() {
            setSipStatus(SipStatus.DISCONNECTED);
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
  }

  const disconnect = useCallback(async () => {
    if (sessionManager) {
      try {
        if (sipStatus === SipStatus.REGISTERED) {
          await sessionManager.unregister();
        }

        await sessionManager.disconnect();

        setSessionManager(null);

        setSessions({});
        setSessionTimer({});
        clearMessages();

        setSipStatus(SipStatus.WAIT_REQUEST_CONNECT);
        setSipStatus(SipStatus.UNREGISTERED);
      } catch (error) {
        console.error("SIP Provider: Error during disconnect:", error);
        setSessionManager(null);
        setSessions({});
        setSessionTimer({});
        clearMessages();
        setSipStatus(SipStatus.DISCONNECTED);
        setSipStatus(SipStatus.UNREGISTERED);
      }
    }
  }, [sessionManager, sipStatus, clearMessages]);

  return (
    <SipContext.Provider
      value={{
        sessionManager,
        connectAndRegister,
        disconnect,
        sipStatus,
        sessions,
        phoneState,
        setPhoneState,
        extensionNumber,
        sessionTimer
      }}
    >
      {children}
    </SipContext.Provider>
  )
}

export const useSip = () => {
  const ctx = useContext(SipContext);
  if (!ctx)
    throw new Error('useSip must be used within SipProvider');

  return ctx;
}

export const useSessionCall = (sessionId: string) => {
  if (!sessionId) return null;
  const { sessions, sessionManager, sessionTimer } = useSip();
  const session = sessions[sessionId];

  const [isMuted, setIsMuted] = useState<boolean>(
    sessionManager?.isMuted(session) || false
  );
  const [isHeld, setIsHeld] = useState<boolean>(
    sessionManager?.isHeld(session) || false
  );

  const direction =
    session instanceof Inviter
      ? SessionDirection.OUTGOING
      : SessionDirection.INCOMING;

  const timer: Timer | undefined = sessionTimer[sessionId];

  return {
    direction,
    session: session,
    timer,
    hold: () => {
      sessionManager?.hold(session);
      setIsHeld(true);
    },
    unhold: () => {
      sessionManager?.unhold(session);
      setIsHeld(false);
    },
    isHeld: isHeld,

    mute: () => {
      sessionManager?.mute(session);
      setIsMuted(true);
    },
    unmute: () => {
      sessionManager?.unmute(session);
      setIsMuted(false);
    },
    isMuted: isMuted,
    answer: () => sessionManager?.answer(session),
    decline: () => sessionManager?.decline(session),
    hangup: () => sessionManager?.hangup(session),
    sendDTMF: (digit: string) => sessionManager?.sendDTMF(session, digit),
  };
};
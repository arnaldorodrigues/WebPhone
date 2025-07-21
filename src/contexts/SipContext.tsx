import { SessionTimer, ISipConfig, ISipMessage, SipStatus, SipContextType, PhoneStateType, SessionDirection, Timer, INotification } from "@/types/siptypes";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Inviter, Session } from "sip.js";
import { SessionManager, SessionManagerOptions } from "sip.js/lib/platform/web";
import { Notification } from "@/components/ui/notification";

export const SipContext = createContext<SipContextType | undefined>(undefined);

export const SipProvider = ({
  children,
  mergedSessionManagerOptions
}: {
  children: React.ReactNode,
  mergedSessionManagerOptions?: SessionManagerOptions;
}) => {
  const refAudioRemote = useRef<HTMLAudioElement>(null);

  const [sessionManager, setSessionManager] = useState<SessionManager | null>(null);
  const [sipStatus, setSipStatus] = useState<SipStatus>(SipStatus.UNREGISTERED);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [sessionTimer, setSessionTimer] = useState<SessionTimer>({});
  const [sipMessages, setSipMessages] = useState<Record<string, ISipMessage>>({});
  const [phoneState, setPhoneState] = useState<PhoneStateType>(null);
  const [extensionNumber, setExtensionNumber] = useState<string>("");
  const [notification, setNotification] = useState<INotification | null>(null);

  const showNotification = useCallback(
    (notification: INotification) => {
      setNotification(notification);

      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch((err: any) => {
        console.warn("Unable to play notification sound", err);
      })
    },
    []
  );

  const addSipMessage = useCallback(
    (message: ISipMessage) => {
      setSipMessages((messages) => ({
        ...messages,
        [message.id]: message,
      }));
    },
    [setSipMessages]
  );

  const clearSipMessages = useCallback(() => {
    setSipMessages({});
  }, [setSipMessages]);

  const updateSession = useCallback(
    (session: Session) => {
      setSessions((prev) => ({
        ...prev,
        [session.id]: session,
      }));
    },
    [setSessions]
  );

  const connectAndRegister = (sipConfig: ISipConfig) => {
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
            showNotification({
              title: "Call Status",
              message: "Call connected successfully",
              type: "success"
            });
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
            showNotification({
              title: "Call Status",
              message: "Call has ended",
              type: "info"
            });
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
            showNotification({
              title: "Incoming Call",
              message: `Call from ${caller}`,
              type: "info"
            });
          },
          onRegistered: () => {
            setSipStatus(SipStatus.REGISTERED);
            showNotification({
              title: "Connection Status",
              message: "Successfully connected to SIP server",
              type: "success"
            });
          },
          onUnregistered: () => {
            setSipStatus(SipStatus.UNREGISTERED);
            showNotification({
              title: "Connection Status",
              message: "Disconnected from SIP server",
              type: "warning"
            });
          },
          onServerConnect() {
            setSipStatus(SipStatus.CONNECTED);
            sessionManager.register();
          },
          onServerDisconnect() {
            setSipStatus(SipStatus.DISCONNECTED);
            showNotification({
              title: "Disconnected",
              message: "Disconnected from SIP server",
              type: "warning"
            });
          },
          onMessageReceived: (message) => {
            const newMessage: ISipMessage = {
              id: Date.now().toString(),
              body: message.request.body || "",
              from: message.request.from?.uri?.user || "unknown",
              timestamp: new Date(),
            };
            addSipMessage(newMessage);
            showNotification({
              title: "New Message",
              message: `Message received from ${newMessage.from}`,
              type: "info"
            });
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
        clearSipMessages();

        setSipStatus(SipStatus.WAIT_REQUEST_CONNECT);
        setSipStatus(SipStatus.UNREGISTERED);
      } catch (error) {
        console.error("SIP Provider: Error during disconnect:", error);
        setSessionManager(null);
        setSessions({});
        setSessionTimer({});
        clearSipMessages();
        setSipStatus(SipStatus.DISCONNECTED);
        setSipStatus(SipStatus.UNREGISTERED);
      }
    }
  }, [sessionManager, sipStatus, clearSipMessages]);

  const handleClose = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <SipContext.Provider
      value={{
        sessionManager,
        connectAndRegister,
        disconnect,
        sipStatus,
        sessions,
        phoneState,
        sipMessages,
        setPhoneState,
        extensionNumber,
        sessionTimer,
        showNotification
      }}
    >
      {children}
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={handleClose}
        />
      )}
      <audio ref={refAudioRemote} />
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
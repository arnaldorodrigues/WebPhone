import { SipStatus, TSipContextType } from "@/types/siptypes";
import { createContext, useCallback, useContext, useState } from "react";
import { Session } from "sip.js";
import { SessionManager } from "sip.js/lib/platform/web";

export const SipContext = createContext<TSipContextType | undefined>(undefined);

export const SipProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [sessionManager, setSessionManager] = useState<SessionManager | null>(null);
  const [sipStatus, setSipStatus] = useState<SipStatus>(SipStatus.UNREGISTERED);
  const [sessions, setSessions] = useState<Record<string, Session>>({});

  const connectAndRegister = () => {

  }

  const disconnect = useCallback(async () => {

  }, []);

  return (
    <SipContext.Provider
      value={{
        sessionManager,
        connectAndRegister,
        disconnect,
        sipStatus,
        sessions,
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
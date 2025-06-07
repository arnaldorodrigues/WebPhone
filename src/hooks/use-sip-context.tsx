"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSip } from "./use-sip";
import { useSettings } from "./use-settings";

interface SipContextType {
  callState: ReturnType<typeof useSip>["callState"];
  isInitialized: boolean;
  error: Error | null;
  makeCall: (number: string) => Promise<void>;
  hangup: () => Promise<void>;
  decline: () => Promise<void>;
  isConfigLoaded: boolean;
}

const SipContext = createContext<SipContextType | null>(null);

export function SipProvider({ children }: { children: ReactNode }) {
  const { sipConfig, isConfigLoaded } = useSettings();
  const { callState, isInitialized, error, makeCall, hangup, decline } =
    useSip(sipConfig);

  return (
    <SipContext.Provider
      value={{
        callState,
        isInitialized,
        error,
        makeCall,
        hangup,
        decline,
        isConfigLoaded,
      }}
    >
      {children}
    </SipContext.Provider>
  );
}

export function useSipContext() {
  const context = useContext(SipContext);
  if (!context) {
    throw new Error("useSipContext must be used within a SipProvider");
  }
  return context;
}

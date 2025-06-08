"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSip } from "./use-sip";
import { useSettings } from "./use-settings";
import { usePhoneState } from "./use-phonestate-context";
import { Invitation } from "sip.js";

interface SipContextType {
  callState: ReturnType<typeof useSip>["callState"];
  isInitialized: boolean;
  error: Error | null;
  incomingInvitation: Invitation | null;
  makeCall: (number: string) => Promise<void>;
  answerCall: () => Promise<void>;
  hangup: () => Promise<void>;
  decline: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleHold: () => Promise<void>;
  enableMicrophone: () => Promise<boolean>;
  isConfigLoaded: boolean;
}

const SipContext = createContext<SipContextType | null>(null);

export function SipProvider({ children }: { children: ReactNode }) {
  const { sipConfig, isConfigLoaded } = useSettings();
  const {
    callState,
    isInitialized,
    error,
    incomingInvitation,
    makeCall,
    answerCall,
    hangup,
    decline,
    toggleMute,
    toggleHold,
    enableMicrophone,
  } = useSip(sipConfig);
  const { setPhoneState } = usePhoneState();

  // Automatically handle incoming calls by setting phone state
  useEffect(() => {
    if (incomingInvitation && callState.incomingCall) {
      console.log("Auto-opening phone dialog for incoming call");
      setPhoneState("receiving");
    }
  }, [incomingInvitation, callState.incomingCall, setPhoneState]);

  // Automatically handle call state changes
  useEffect(() => {
    console.log("SIP Context: Call state changed:", {
      isCallActive: callState.isCallActive,
      callDuration: callState.callDuration,
      remoteNumber: callState.remoteNumber,
      incomingCall: callState.incomingCall,
    });

    // Only auto-transition to calling if call becomes active and we're not already in calling state
    if (callState.isCallActive) {
      console.log(
        "SIP Context: Call is active, transitioning to calling state"
      );
      setPhoneState("calling");
    }
    // Transition to ended if call was active and now ended (has duration OR was previously active)
    // The SIP client sets callDuration = 1 for canceled calls to trigger this transition
    else if (!callState.isCallActive && callState.callDuration > 0) {
      console.log(
        "SIP Context: Call ended (remote termination or cancellation), transitioning to ended state"
      );
      console.log("Final call duration:", callState.callDuration, "seconds");
      setPhoneState("ended");
    }
  }, [callState.isCallActive, callState.callDuration, setPhoneState]);

  return (
    <SipContext.Provider
      value={{
        callState,
        isInitialized,
        error,
        incomingInvitation,
        makeCall,
        answerCall,
        hangup,
        decline,
        toggleMute,
        toggleHold,
        enableMicrophone,
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

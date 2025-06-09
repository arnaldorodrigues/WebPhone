"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import DialDisplay from "@/components/feature/phone/dial/dial-display";
import DialPad from "@/components/feature/phone/dial/dial-pad";
import { SessionState } from "sip.js";

// import { useSipContext } from "@/hooks/use-sip-context";
import { usePhoneState } from "@/hooks/use-phonestate-context";
import {
  useSessionCall,
  useSIPProvider,
} from "@/hooks/sip-provider/sip-provider-context";
import { useSettings } from "@/hooks/use-settings";
import { CallSessionItem } from "./call-session-item";

interface PhoneCallProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneCallDialog({ isOpen, onClose }: PhoneCallProps) {
  const { phoneState, setPhoneState } = usePhoneState();
  const { sessions, sessionManager } = useSIPProvider();
  const [number, setNumber] = useState("");
  const [lastRemoteNumber, setLastRemoteNumber] = useState("");
  const { settings } = useSettings();

  useEffect(() => {
    if (Object.keys(sessions).length === 0 && phoneState !== "dialing") {
      setPhoneState(null);
    }
  }, [sessions]);

  const handleDial = (c: string) => {
    if (c === "backspace") {
      setNumber(number.slice(0, number.length - 1));
    } else if (number.length < 12) {
      setNumber(number + c);
    }
  };

  const dialogContent = (
    <>
      <div className="flex-1">
        <DialDisplay value={number} />
      </div>
      <div className="w-full min-h-3/5">
        <DialPad
          onPressButton={handleDial}
          onCall={async () => {
            if (!number.trim()) {
              console.error("No number to call");
              return;
            }

            try {
              console.log("UI: Initiating call to:", number);
              setPhoneState("sending");
              setLastRemoteNumber(number); // Store the number we're calling
              await sessionManager?.call(`sip:${number}@${settings.domain}`);
              console.log("UI: Call initiated successfully");
            } catch (error) {
              console.error("UI: Failed to make call:", error);
              setPhoneState("ended");
              // Show error to user
              if (error instanceof Error) {
                alert(`Call failed: ${error.message}`);
              }
            }
          }}
        />
      </div>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      maxWidth="lg"
      closeOnOutsideClick={false}
    >
      {phoneState === "dialing"
        ? dialogContent
        : sessions &&
          Object.keys(sessions).map((sessionId) => {
            const session = sessions[sessionId];
            if (
              ![SessionState.Terminating, SessionState.Terminated].includes(
                session?.state
              )
            )
              return <CallSessionItem key={sessionId} sessionId={sessionId} />;
            return null;
          })}
    </Dialog>
  );
}

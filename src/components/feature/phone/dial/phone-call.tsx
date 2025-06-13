"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import DialDisplay from "@/components/feature/phone/dial/dial-display";
import DialPad from "@/components/feature/phone/dial/dial-pad";
import { SessionState } from "sip.js";

// import { useSipContext } from "@/hooks/use-sip-context";
import { usePhoneState } from "@/hooks/use-phonestate-context";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { CallSessionItem } from "./call-session-item";
import { useUserData } from "@/hooks/use-userdata";

interface PhoneCallProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneCallDialog({ isOpen, onClose }: PhoneCallProps) {
  const { phoneState, setPhoneState } = usePhoneState();
  const { sessions, sessionManager } = useSIPProvider();
  const [number, setNumber] = useState("");
  const [lastRemoteNumber, setLastRemoteNumber] = useState("");
  const { sipConfig } = useUserData();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(sessions).length === 0 && phoneState !== "dialing") {
      setPhoneState(null);
    }
  }, [sessions]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard input when the dialog is open and in dialing mode
      if (!isOpen || phoneState !== "dialing") return;

      const key = event.key;

      // Handle number keys (0-9)
      if (/^[0-9*#]$/.test(key)) {
        event.preventDefault();
        handleDial(key);
      }
      // Handle backspace
      else if (key === "Backspace") {
        event.preventDefault();
        handleDial("backspace");
      }
      // Handle Enter key to make the call
      else if (key === "Enter") {
        event.preventDefault();
        if (number.trim()) {
          handleCall();
        }
      }
    };

    // Add event listener when dialog is open
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Focus the dialog content to ensure it can receive keyboard events
      setTimeout(() => {
        if (dialogRef.current) {
          dialogRef.current.focus();
        }
      }, 100);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, phoneState, number]);

  const handleDial = (c: string) => {
    if (c === "backspace") {
      setNumber(number.slice(0, number.length - 1));
    } else if (number.length < 8) {
      setNumber(number + c);
    }
  };

  const handleCall = async () => {
    if (!number.trim()) {
      console.error("No number to call");
      return;
    }

    try {
      console.log("UI: Initiating call to:", number);
      setLastRemoteNumber(number); // Store the number we're calling
      await sessionManager?.call(`sip:${number}@${sipConfig?.server}`);
      setPhoneState("sending");
      console.log("UI: Call initiated successfully");
    } catch (error) {
      console.error("UI: Failed to make call:", error);
      // setPhoneState("ended");
      // Show error to user
      if (error instanceof Error) {
        alert(`Call failed: ${error.message}`);
      }
    }
  };

  const dialogContent = (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="outline-none"
      style={{ outline: "none" }}
    >
      <div className="flex-1">
        <DialDisplay value={number} />
      </div>
      <div className="w-full min-h-3/5">
        <DialPad onPressButton={handleDial} onCall={handleCall} />
      </div>
    </div>
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

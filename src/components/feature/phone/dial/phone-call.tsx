"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import DialDisplay from "@/components/feature/phone/dial/dial-display";
import DialPad from "@/components/feature/phone/dial/dial-pad";
import { SessionState } from "sip.js";

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || phoneState !== "dialing") return;

      const key = event.key;

      if (/^[0-9*#]$/.test(key)) {
        event.preventDefault();
        handleDial(key);
      } else if (key === "Backspace") {
        event.preventDefault();
        handleDial("backspace");
      } else if (key === "Enter") {
        event.preventDefault();
        if (number.trim()) {
          handleCall();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        if (dialogRef.current) {
          dialogRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, phoneState, number]);

  const handleDial = (c: string) => {
    if (c === "backspace") {
      setNumber(number.slice(0, number.length - 1));
    } else if (number.length < 12) {
      setNumber(number + c);
    }
  };

  const handleCall = async () => {
    if (!number.trim()) {
      console.error("No number to call");
      return;
    }

    try {
      setLastRemoteNumber(number);
      await sessionManager?.call(`sip:${number}@${sipConfig?.server}`);
      setPhoneState("sending");
    } catch (error) {
      console.error("UI: Failed to make call:", error);
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
          Object.keys(sessions).map((sessionId, index) => {
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

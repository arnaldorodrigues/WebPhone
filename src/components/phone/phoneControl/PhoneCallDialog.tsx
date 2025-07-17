"use client";

import { Dialog } from "@/components/ui/dialogs";
import { useSip } from "@/contexts/SipContext";
import { useState, useEffect, useRef } from "react";
import { SessionState } from "sip.js";
import DialPad from "./DialPad";
import { CallSessionItem } from "./CallSessionItem";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type Props = {
  isOpen: boolean;
  onClose: () => void;
}

const PhoneCallDialog: React.FC<Props> = ({
  isOpen,
  onClose
}) => {
  const { sessions, sessionManager, phoneState, setPhoneState } = useSip();

  const { userData } = useSelector((state: RootState) => state.userdata);

  const [number, setNumber] = useState("");
  const [lastRemoteNumber, setLastRemoteNumber] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessions && Object.keys(sessions).length > 0) {
      const sessionIds = Object.keys(sessions);
      let flag = false;
      for (let i = 0; i < sessionIds.length; i++) {
        const sessionId = sessionIds[i];
        const session = sessions[sessionId];
        if (
          session?.state !== SessionState.Terminated &&
          session?.state !== SessionState.Terminating
        ) {
          flag = true;
          break;
        }
      }
      if (flag) {
        setPhoneState("calling");
      } else {
        setPhoneState(null);
      }
    } else {
      setPhoneState(null);
    }
  }, [sessions, setPhoneState]);

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
      await sessionManager?.call(`sip:${number}@${userData?.domain}`);
      setPhoneState("sending");
    } catch (error) {
      console.error("UI: Failed to make call:", error);
      if (error instanceof Error) {
        alert(`Call failed: ${error.message}`);
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      maxWidth="lg"
      closeOnOutsideClick={false}
    >
      {phoneState === "dialing" ? (
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="outline-none"
          style={{ outline: "none" }}
        >
          <div className="flex-1">
            <div className="w-full h-full p-6 flex flex-col gap-4 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-t-2xl shadow-lg">
              <div className="p-4 text-white w-full text-5xl font-light flex items-center overflow-x-auto">
                <span className="h-10 text-4xl tracking-wider text-white/90 sm:h-12 sm:text-5xl">
                  {number}
                </span>
                <span className="h-8 w-0.5 animate-pulse rounded-full bg-white/30 ml-2 sm:h-10" />
              </div>
            </div>
          </div>
          <div className="w-full min-h-3/5">
            <DialPad onPressButton={handleDial} onCall={handleCall} />
          </div>
        </div>
      ) : (sessions &&
        Object.keys(sessions).map((sessionId) => {
          const session = sessions[sessionId];
          if (![SessionState.Terminating, SessionState.Terminated].includes(session?.state))
            return <CallSessionItem key={sessionId} sessionId={sessionId} />;
          else
            return null;
        }))
      }
    </Dialog>
  );
}

export default PhoneCallDialog;
"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import DialDisplay from "@/components/feature/phone/dial/dial-display";
import DialPad from "@/components/feature/phone/dial/dial-pad";

import { SipConfig } from "@/lib/sip-client";
import { settingsStorage } from "@/lib/storage";
import { useSipContext } from "@/hooks/use-sip-context";

interface PhoneCallProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneCallDialog({ isOpen, onClose }: PhoneCallProps) {
  const settings = settingsStorage.get();
  const config: SipConfig | null = {
    wsServer: settings.wsServer,
    wsPort: settings.wsPort,
    wsPath: settings.wsPath,
    server: settings.domain,
    username: settings.sipUsername,
    password: settings.sipPassword,
    displayName: settings.fullName,
  };
  const { callState, isInitialized, error, makeCall, hangup, isConfigLoaded } =
    useSipContext();
  const [number, setNumber] = useState("");

  useEffect(() => {
    if (!callState.isCallActive && callState.callDuration > 0) {
      onClose?.();
    }
  }, [callState.isCallActive, callState.callDuration, onClose]);

  const handleDial = (c: string) => {
    if (c === "backspace") {
      setNumber(number.slice(0, number.length - 1));
    } else if (number.length < 15) {
      setNumber(number + c);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  let dialogContent = null;

  dialogContent = (
    <div className="w-full flex flex-col gap-4">
      {callState.isCallActive ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-medium">Call in progress</div>
            <div className="text-sm text-gray-500">
              {callState.remoteNumber}
            </div>
            <div className="text-2xl font-mono mt-2">
              {formatDuration(callState.callDuration)}
            </div>
          </div>
          <button
            onClick={hangup}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            End Call
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <DialDisplay value={number} />
          </div>
          <div className="w-full min-h-3/5">
            <DialPad
              onPressButton={handleDial}
              onCall={() => makeCall(number)}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
        hangup();
      }}
      title="Call"
      maxWidth="xl"
    >
      {dialogContent}
    </Dialog>
  );
}

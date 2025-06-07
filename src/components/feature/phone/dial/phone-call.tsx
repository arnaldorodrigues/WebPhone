"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import DialDisplay from "@/components/feature/phone/dial/dial-display";
import DialPad from "@/components/feature/phone/dial/dial-pad";
import { PhoneIcon } from "@heroicons/react/24/solid";

import { useSipContext } from "@/hooks/use-sip-context";
import { usePhoneState } from "@/hooks/use-phonestate-context";

interface PhoneCallProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneCallDialog({ isOpen, onClose }: PhoneCallProps) {
  const { phoneState, setPhoneState } = usePhoneState();
  const {
    callState,
    isInitialized,
    error,
    makeCall,
    hangup,
    isConfigLoaded,
    decline,
  } = useSipContext();
  const [number, setNumber] = useState("");

  useEffect(() => {
    if (!callState.isCallActive && callState.callDuration > 0) {
      onClose?.();
    }
  }, [callState.isCallActive, callState.callDuration, onClose]);

  const handleDial = (c: string) => {
    if (c === "backspace") {
      setNumber(number.slice(0, number.length - 1));
    } else if (number.length < 12) {
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
  switch (phoneState) {
    case "dialing":
      dialogContent = (
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
      );
      break;
    case "sending":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
            <PhoneIcon className="w-10 h-10 text-blue-500 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-gray-800">Calling...</p>
            <p className="text-base text-gray-600 font-medium">
              {callState.remoteNumber || number}
            </p>
          </div>
          <button
            onClick={() => {
              hangup();
              setPhoneState("ended");
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Cancel Call
          </button>
        </div>
      );
      break;
    case "receiving":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
            <PhoneIcon className="w-10 h-10 text-green-500 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-gray-800">Incoming Call</p>
            <p className="text-base text-gray-600 font-medium">
              {callState.remoteNumber || number}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                // Accept call logic here
                setPhoneState("calling");
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Accept
            </button>
            <button
              onClick={async () => {
                try {
                  await decline();
                  setPhoneState("ended");
                } catch (error) {
                  console.error("Failed to decline call:", error);
                }
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Decline
            </button>
          </div>
        </div>
      );
      break;
    case "calling":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
            <PhoneIcon className="w-10 h-10 text-blue-500" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-gray-800">
              Call in Progress
            </p>
            <p className="text-base text-gray-600 font-medium">
              {callState.remoteNumber || number}
            </p>
            <p className="text-sm text-gray-500 font-medium mt-2">
              {formatDuration(callState.callDuration)}
            </p>
          </div>
          <button
            onClick={() => {
              hangup();
              setPhoneState("ended");
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            End Call
          </button>
        </div>
      );
      break;
    case "ended":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-lg">
            <PhoneIcon className="w-10 h-10 text-gray-500" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-gray-800">Call Ended</p>
            <p className="text-base text-gray-600 font-medium">
              {callState.remoteNumber || number}
            </p>
            {callState.callDuration > 0 && (
              <p className="text-sm text-gray-500 font-medium mt-2">
                Duration: {formatDuration(callState.callDuration)}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setPhoneState("dialing");
              setNumber("");
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            New Call
          </button>
        </div>
      );
      break;
    default:
      break;
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      maxWidth="xl"
    >
      <div className="w-full flex flex-col gap-4 bg-white rounded-lg p-6">
        {dialogContent}
      </div>
    </Dialog>
  );
}

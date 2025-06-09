"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import DialDisplay from "@/components/feature/phone/dial/dial-display";
import DialPad from "@/components/feature/phone/dial/dial-pad";
import {
  PhoneIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  PauseIcon,
  PlayIcon,
  PhoneXMarkIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { MicrophoneIcon as MicrophoneSlashIcon } from "@heroicons/react/24/outline";

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
    incomingInvitation,
    makeCall,
    answerCall,
    hangup,
    isConfigLoaded,
    decline,
    toggleMute,
    toggleHold,
  } = useSipContext();
  const [number, setNumber] = useState("");
  const [lastRemoteNumber, setLastRemoteNumber] = useState("");

  // Handle incoming calls
  useEffect(() => {
    if (incomingInvitation && callState.incomingCall) {
      console.log("Incoming call detected, switching to receiving state");
      setPhoneState("receiving");
    }
  }, [incomingInvitation, callState.incomingCall, setPhoneState]);

  // Store remote number when available
  useEffect(() => {
    if (callState.remoteNumber) {
      setLastRemoteNumber(callState.remoteNumber);
    }
  }, [callState.remoteNumber]);

  // Handle call state changes
  useEffect(() => {
    if (callState.isCallActive && phoneState !== "calling") {
      setPhoneState("calling");
    } else if (!callState.isCallActive && callState.callDuration > 0) {
      setPhoneState("ended");
    }
  }, [
    callState.isCallActive,
    callState.callDuration,
    phoneState,
    setPhoneState,
  ]);

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
              onCall={async () => {
                if (!number.trim()) {
                  console.error("No number to call");
                  return;
                }

                try {
                  console.log("UI: Initiating call to:", number);
                  setPhoneState("sending");
                  setLastRemoteNumber(number); // Store the number we're calling
                  await makeCall(number);
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
      break;
    case "sending":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-8 py-16">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <PhoneIcon className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">
              Connecting Call
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              {callState.remoteNumber || number}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span className="ml-2">Establishing connection</span>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                console.log("Canceling call...");
                await hangup();
                console.log("Call cancellation completed");
                // Explicitly set phone state to ended after cancellation
                setPhoneState("ended");
              } catch (error) {
                console.error("Failed to cancel call:", error);
                // Ensure phone state is set to ended even on error
                setPhoneState("ended");
              }
            }}
            className="flex items-center space-x-2 px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <XMarkIcon className="w-5 h-5" />
            <span>Cancel Call</span>
          </button>
        </div>
      );
      break;
    case "receiving":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-8 py-16">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
              <PhoneIcon className="w-12 h-12 text-white animate-bounce" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">Incoming Call</h2>
            <p className="text-lg text-gray-600 font-medium">
              {callState.remoteNumber || "Unknown Caller"}
            </p>
          </div>
          <div className="flex gap-6">
            <button
              onClick={async () => {
                try {
                  console.log("Accepting incoming call...");
                  await answerCall();
                  setPhoneState("calling");
                } catch (error) {
                  console.error("Failed to answer call:", error);
                  setPhoneState("ended");
                }
              }}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <CheckIcon className="w-6 h-6" />
              <span className="font-medium">Accept</span>
            </button>
            <button
              onClick={async () => {
                try {
                  console.log("Declining incoming call...");
                  await decline();
                  setPhoneState("ended");
                } catch (error) {
                  console.error("Failed to decline call:", error);
                  setPhoneState("ended");
                }
              }}
              className="flex items-center space-x-2 px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <XMarkIcon className="w-6 h-6" />
              <span className="font-medium">Decline</span>
            </button>
          </div>
        </div>
      );
      break;
    case "calling":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-8 py-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <PhoneIcon className="w-12 h-12 text-white" />
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">
              {callState.isOnHold ? "Call on Hold" : "Call in Progress"}
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              {callState.remoteNumber || number}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  callState.isOnHold ? "bg-amber-500" : "bg-emerald-500"
                }`}
              ></div>
              <span className="font-medium">
                {formatDuration(callState.callDuration)}
              </span>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-col space-y-2">
              {callState.isOnHold && (
                <div className="flex items-center justify-center space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <PauseIcon className="w-4 h-4" />
                  <span>Call is on hold</span>
                </div>
              )}
              {callState.isMuted && (
                <div className="flex items-center justify-center space-x-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg">
                  <MicrophoneSlashIcon className="w-4 h-4" />
                  <span>Microphone muted</span>
                </div>
              )}
            </div>
          </div>

          {/* Call Control Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {/* Mute/Unmute Button */}
            <button
              onClick={async () => {
                try {
                  await toggleMute();
                } catch (error) {
                  console.error("Failed to toggle mute:", error);
                }
              }}
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                callState.isMuted
                  ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              }`}
            >
              {callState.isMuted ? (
                <MicrophoneSlashIcon className="w-6 h-6" />
              ) : (
                <MicrophoneIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">
                {callState.isMuted ? "Unmute" : "Mute"}
              </span>
            </button>

            {/* Hold/Resume Button */}
            <button
              onClick={async () => {
                try {
                  await toggleHold();
                } catch (error) {
                  console.error("Failed to toggle hold:", error);
                }
              }}
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                callState.isOnHold
                  ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  : "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              }`}
            >
              {callState.isOnHold ? (
                <PlayIcon className="w-6 h-6" />
              ) : (
                <PauseIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">
                {callState.isOnHold ? "Resume" : "Hold"}
              </span>
            </button>
          </div>

          {/* End Call Button */}
          <button
            onClick={async () => {
              try {
                await hangup();
                // Don't manually set phone state - let SIP context handle it automatically
              } catch (error) {
                console.error("Failed to end call:", error);
                // Only set to ended on error
                setPhoneState("ended");
              }
            }}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PhoneXMarkIcon className="w-6 h-6" />
            <span className="font-medium">End Call</span>
          </button>
        </div>
      );
      break;
    case "ended":
      dialogContent = (
        <div className="flex flex-col items-center justify-center gap-8 py-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg">
            <PhoneXMarkIcon className="w-12 h-12 text-white" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">Call Ended</h2>
            <p className="text-lg text-gray-600 font-medium">
              {lastRemoteNumber || "Unknown Number"}
            </p>
            {/* {callState.callDuration > 0 && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="font-medium">
                  Duration: {formatDuration(callState.callDuration)}
                </span>
              </div>
            )} */}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setPhoneState("dialing");
                setNumber("");
                setLastRemoteNumber(""); // Clear stored remote number
              }}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PhoneIcon className="w-5 h-5" />
              <span className="font-medium">New Call</span>
            </button>
            <button
              onClick={() => {
                onClose();
              }}
              className="flex items-center space-x-2 px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="font-medium">Close</span>
            </button>
          </div>
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
      closeOnOutsideClick={false}
    >
      {dialogContent}
    </Dialog>
  );
}

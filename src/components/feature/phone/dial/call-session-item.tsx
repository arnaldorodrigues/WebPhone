import { useSessionCall } from "@/hooks/sip-provider/sip-provider-context";
import {
  CheckIcon,
  MicrophoneIcon,
  MicrophoneIcon as MicrophoneSlashIcon,
  PauseIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { Session, SessionState } from "sip.js";
import { SessionDirection } from "@/types/sip-type";
import { PhoneStateType, usePhoneState } from "@/hooks/use-phonestate-context";
import { formatDuration } from "@/utils/format-duration";
import { useEffect } from "react";

export const CallSessionItem = ({ sessionId }: { sessionId: string }) => {
  const sessionCall = useSessionCall(sessionId);
  const { phoneState, setPhoneState } = usePhoneState();
  const {
    answer,
    mute,
    unmute,
    hold,
    unhold,
    hangup,
    session,
    isHeld,
    isMuted,
    direction,
  } = sessionCall || {};

  useEffect(() => {
    if (
      session?.state &&
      [SessionState.Terminating, SessionState.Terminated].includes(
        session.state
      )
    ) {
      hangup?.();
    }
  }, [session?.state]);

  return (
    <>
      {/* Outgoing call */}
      {direction === SessionDirection.OUTGOING &&
        (session?.state === SessionState.Establishing ||
          session?.state === SessionState.Initial) && (
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
                {session?.remoteIdentity?.uri?.user || "Unknown Number"}
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
                  await hangup?.();
                  console.log("Call cancellation completed");
                  // Explicitly set phone state to ended after cancellation
                  // setPhoneState("ended");
                } catch (error) {
                  console.error("Failed to cancel call:", error);
                  // Ensure phone state is set to ended even on error
                  // setPhoneState("ended");
                }
              }}
              className="flex items-center space-x-2 px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <XMarkIcon className="w-5 h-5" />
              <span>Cancel Call</span>
            </button>
          </div>
        )}

      {/* Incoming call */}
      {direction === SessionDirection.INCOMING &&
        (session?.state === SessionState.Initial ||
          session?.state === SessionState.Establishing) && (
          <div className="flex flex-col items-center justify-center gap-8 py-16">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
                <PhoneIcon className="w-12 h-12 text-white animate-bounce" />
              </div>
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-800">
                Incoming Call
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                {session?.remoteIdentity?.uri?.user || "Unknown Number"}
              </p>
            </div>
            <div className="flex gap-6">
              <button
                onClick={async () => {
                  try {
                    console.log("Accepting incoming call...");
                    await answer?.();
                    // setPhoneState("calling");
                  } catch (error) {
                    console.error("Failed to answer call:", error);
                    // setPhoneState("ended");
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
                    await hangup?.();
                    // setPhoneState("ended");
                  } catch (error) {
                    console.error("Failed to decline call:", error);
                    // setPhoneState("ended");
                  }
                }}
                className="flex items-center space-x-2 px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <XMarkIcon className="w-6 h-6" />
                <span className="font-medium">Decline</span>
              </button>
            </div>
          </div>
        )}

      {/* Established call */}
      {session?.state === SessionState.Established && (
        <div className="flex flex-col items-center justify-center gap-8 py-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <PhoneIcon className="w-12 h-12 text-white" />
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">
              {isHeld ? "Call on Hold" : "Call in Progress"}
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              {session?.remoteIdentity?.uri?.user || "Unknown Number"}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  isHeld ? "bg-amber-500" : "bg-emerald-500"
                }`}
              ></div>
              <span className="font-medium">
                {/* {formatDuration(session?.callDuration || 0) || "00:00"} */}
              </span>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-col space-y-2">
              {isHeld && (
                <div className="flex items-center justify-center space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <PauseIcon className="w-4 h-4" />
                  <span>Call is on hold</span>
                </div>
              )}
              {isMuted && (
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
                  if (isMuted) {
                    await unmute?.();
                  } else {
                    await mute?.();
                  }
                } catch (error) {
                  console.error("Failed to toggle mute:", error);
                }
              }}
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isMuted
                  ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              }`}
            >
              {isMuted ? (
                <MicrophoneSlashIcon className="w-6 h-6" />
              ) : (
                <MicrophoneIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </button>

            {/* Hold/Resume Button */}
            <button
              onClick={async () => {
                try {
                  if (isHeld) {
                    await unhold?.();
                  } else {
                    await hold?.();
                  }
                } catch (error) {
                  console.error("Failed to toggle hold:", error);
                }
              }}
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isHeld
                  ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  : "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              }`}
            >
              {isHeld ? (
                <PlayIcon className="w-6 h-6" />
              ) : (
                <PauseIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">
                {isHeld ? "Resume" : "Hold"}
              </span>
            </button>
          </div>

          {/* End Call Button */}
          <button
            onClick={async () => {
              try {
                await hangup?.();
                // Don't manually set phone state - let SIP context handle it automatically
              } catch (error) {
                console.error("Failed to end call:", error);
                // Only set to ended on error
                // setPhoneState("ended");
              }
            }}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <XMarkIcon className="w-6 h-6" />
            <span className="font-medium">End Call</span>
          </button>
        </div>
      )}

      {/*Terminated call*/}
      {session?.state &&
        [SessionState.Terminating, SessionState.Terminated].includes(
          session?.state
        ) && (
          <CallEnded
            session={session}
            setPhoneState={(state) => setPhoneState(state as any)}
          />
        )}
    </>
  );
};

const CallEnded = ({
  session,
  setPhoneState,
}: {
  session: Session | undefined;
  setPhoneState: (state: PhoneStateType | null) => void;
}) => {
  {
    useEffect(() => {
      const timer = setTimeout(() => {
        setPhoneState(null);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);
  }
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg">
        <PhoneXMarkIcon className="w-12 h-12 text-white" />
      </div>
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-800">Call Ended</h2>
        <p className="text-lg text-gray-600 font-medium">
          {session?.remoteIdentity?.uri?.user || "Unknown Number"}
        </p>

        {/* {session?.callDuration && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="font-medium">
                  Duration: {formatDuration(Number(session?.callDuration) || 0)}
                </span>
              </div>
            )} */}
      </div>
    </div>
  );
};

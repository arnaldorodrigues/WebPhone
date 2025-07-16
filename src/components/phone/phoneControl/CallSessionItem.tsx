import {
  BackspaceIcon,
  CalculatorIcon,
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
import { useEffect, useRef, useState } from "react";
import { useSessionCall, useSip } from "@/contexts/SipContext";
import { PhoneStateType, SessionDirection } from "@/types/siptypes";

export const CallSessionItem = ({ sessionId }: { sessionId: string }) => {
  const sessionCall = useSessionCall(sessionId);
  const { phoneState, setPhoneState } = useSip();

  const {
    answer,
    mute,
    unmute,
    hold,
    unhold,
    hangup,
    sendDTMF,
    session,
    isHeld,
    isMuted,
    direction,
  } = sessionCall || {};

  const [showDialpad, setShowDialpad] = useState(false);
  const [dialedNumbers, setDialedNumbers] = useState<string[]>([]);

  const outgoingAudioRef = useRef<HTMLAudioElement | null>(null);
  const incomingAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleDTMF = (digit: string) => {
    if (dialedNumbers.length < 12) {
      setDialedNumbers((prev) => [...prev, digit]);
      sendDTMF?.(digit);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && showDialpad) {
      setShowDialpad(false);
    }
  };

  useEffect(() => {
    if (showDialpad) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showDialpad]);

  useEffect(() => {
    if (direction === SessionDirection.OUTGOING && (
      session?.state === SessionState.Initial ||
      session?.state === SessionState.Establishing
    )) {
      if (!outgoingAudioRef.current) {
        outgoingAudioRef.current = new Audio("sounds/outgoing-ring.mp3");
        outgoingAudioRef.current.loop = true;
      }
      outgoingAudioRef.current.play().catch((err: any) =>
        console.warn("Failed to play outgoing ring: ", err)
      );
    }

    if (direction === SessionDirection.INCOMING && (
      session?.state === SessionState.Initial ||
      session?.state === SessionState.Establishing
    )) {
      if (!incomingAudioRef.current) {
        incomingAudioRef.current = new Audio("sounds/incoming-ring.mp3");
        incomingAudioRef.current.loop = true;
      }
      incomingAudioRef.current.play().catch((err: any) =>
        console.warn("Failed to play outgoing ring: ", err)
      );
    }

    if (session?.state === SessionState.Established || session?.state === SessionState.Terminated) {
      incomingAudioRef.current?.pause();
      outgoingAudioRef.current?.pause();
    }
  }, [session?.state, direction])

  return (
    <>
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
                  await hangup?.();
                } catch (error) {
                  console.error("Failed to cancel call:", error);
                }
              }}
              className="flex items-center space-x-2 px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <XMarkIcon className="w-5 h-5" />
              <span>Cancel Call</span>
            </button>
          </div>
        )}

      {direction === SessionDirection.INCOMING &&
        (session?.state === SessionState.Initial ||
          session?.state === SessionState.Establishing) && (
          <div className="flex flex-col items-center justify-center gap-8 py-16">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <PhoneIcon className="w-12 h-12 text-white" />
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
                    incomingAudioRef.current?.pause();
                    await answer?.();
                  } catch (error) {
                    console.error("Failed to answer call:", error);
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
                    incomingAudioRef.current?.pause();
                    await hangup?.();
                  } catch (error) {
                    console.error("Failed to decline call:", error);
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

      {session?.state === SessionState.Established && (
        <div className="relative flex flex-col items-center justify-center gap-6 py-8 min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <PhoneIcon className="w-10 h-10 text-white" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              {isHeld ? "Call on Hold" : "Call in Progress"}
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              {session?.remoteIdentity?.uri?.user || "Unknown Number"}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${isHeld ? "bg-amber-500" : "bg-emerald-500"
                  }`}
              ></div>
            </div>

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

          <div className="grid grid-cols-3 gap-4 w-full max-w-sm px-4">
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
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${isMuted
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
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${isHeld
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

            <button
              onClick={() => setShowDialpad(!showDialpad)}
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${showDialpad
                ? "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                : "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                }`}
            >
              <CalculatorIcon className="w-6 h-6" />
              <span className="text-sm font-medium">Keypad</span>
            </button>
          </div>

          <button
            onClick={async () => {
              try {
                await hangup?.();
              } catch (error) {
                console.error("Failed to end call:", error);
              }
            }}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <XMarkIcon className="w-6 h-6" />
            <span className="font-medium">End Call</span>
          </button>

          {/* DTMF Keypad Overlay */}
          {showDialpad && (
            <div
              className="absolute inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowDialpad(false);
                }
              }}
            >
              <div className="bg-white/90 rounded-2xl w-full max-w-sm mx-4 shadow-xl">
                <div className="relative w-full p-6 flex flex-col gap-4 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-t-2xl">
                  <button
                    onClick={() => setShowDialpad(false)}
                    className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                  <div className="p-4 text-white w-full text-5xl font-light flex items-center overflow-x-auto">
                    <span className="h-10 text-4xl tracking-wider text-white/70 ">
                      {dialedNumbers.join("")}
                    </span>
                    <span className="h-8 w-0.5 animate-pulse rounded-full bg-white/30 ml-2" />
                  </div>
                </div>
                <div className="w-full h-full grid grid-cols-3 grid-rows-5 gap-4 p-6">
                  {[
                    ...Array.from({ length: 9 }, (_, i) => i + 1),
                    "*",
                    0,
                    "#",
                  ].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleDTMF(`${num}`)}
                      className="row-span-1 col-span-1 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-2xl font-medium cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                      {num}
                    </button>
                  ))}
                  <div className="row-span-1 col-span-1"></div>
                  <div className="row-span-1 col-span-1"></div>
                  <button
                    onClick={() => {
                      if (dialedNumbers.length > 0) {
                        setDialedNumbers((prev) => prev.slice(0, -1));
                      }
                    }}
                    className="row-span-1 col-span-1 rounded-xl bg-white shadow-md hover:shadow-lg hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    <BackspaceIcon className="w-8 h-8 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
      </div>
    </div>
  );
};

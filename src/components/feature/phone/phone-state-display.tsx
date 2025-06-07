"use client";

import { usePhoneState } from "@/hooks/use-phonestate-context";

export function PhoneStateDisplay() {
  const { phoneState, setPhoneState, extensionNumber } = usePhoneState();

  const getStateColor = (state: typeof phoneState) => {
    switch (state) {
      case "dialing":
        return "text-blue-500";
      case "sending":
        return "text-yellow-500";
      case "receiving":
        return "text-green-500";
      case "calling":
        return "text-purple-500";
      case "ended":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Phone State</h3>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${getStateColor(
                phoneState
              ).replace("text", "bg")}`}
            />
            <p className={`text-sm font-medium ${getStateColor(phoneState)}`}>
              {phoneState || "Idle"}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Extension: {extensionNumber}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPhoneState("dialing")}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Set Dialing
          </button>
          <button
            onClick={() => setPhoneState("sending")}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
          >
            Set Sending
          </button>
          <button
            onClick={() => setPhoneState("receiving")}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Set Receiving
          </button>
          <button
            onClick={() => setPhoneState("calling")}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Set Calling
          </button>
          <button
            onClick={() => setPhoneState("ended")}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Set Ended
          </button>
          <button
            onClick={() => setPhoneState(null)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

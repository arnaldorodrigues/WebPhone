"use client";

import { useEffect, useState } from "react";
import { PhoneCallDialog } from "@/components/feature/phone/dial/phone-call";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/useAuth";
import {
  Cog8ToothIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import SettingDialog from "@/components/feature/setting/setting-dialog";
import { usePhoneState } from "@/hooks/use-phonestate-context";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { CONNECT_STATUS, RegisterStatus } from "@/types/sip-type";
import { SessionState } from "sip.js";

export function Me() {
  const [isShowSettingDialog, setIsShowSettingDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { connectAndRegister, registerStatus, sessions, connectStatus } =
    useSIPProvider();
  const { sipConfig, settings, isConfigLoaded, refreshSettings } =
    useSettings();
  const { logout } = useAuth();
  const { phoneState, setPhoneState } = usePhoneState();

  useEffect(() => {
    if (
      sipConfig &&
      isConfigLoaded &&
      connectStatus === CONNECT_STATUS.WAIT_REQUEST_CONNECT &&
      registerStatus === RegisterStatus.UNREGISTERED
    ) {
      try {
        connectAndRegister(sipConfig);
      } catch (error) {
        console.error("Failed to connect and register:", error);
      }
    }
  }, [
    sipConfig,
    isConfigLoaded,
    connectAndRegister,
    connectStatus,
    registerStatus,
  ]);

  // Handle incoming calls
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

  // Force refresh when settings change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [settings, sipConfig]);

  // Keyboard shortcut for logout (Ctrl+Shift+Q)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "Q") {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  // if (phoneState !== "dialing") {
  //   if (sessions && Object.keys(sessions).length > 0) {
  //     setPhoneState("calling");
  //   } else {
  //     setPhoneState(null);
  //   }
  // }

  // Get display name and username from settings
  const displayName = sipConfig?.displayName || settings.fullName || "User";
  const username = sipConfig?.username || settings.sipUsername || "";
  const server = sipConfig?.server || settings.domain || "";

  const userDisplayText =
    isConfigLoaded && username ? `${displayName}` : "Not Configured";

  const handleSettingsClose = async () => {
    setIsShowSettingDialog(false);
    // Force a refresh when settings dialog closes (in case settings were saved)
    await refreshSettings();
    setRefreshKey((prev) => prev + 1);
  };

  const handleSignout = async () => {
    try {
      // Disconnect all active SIP sessions before logging out
      if (sessions && Object.keys(sessions).length > 0) {
        Object.values(sessions).forEach((session) => {
          if (session && session.state !== SessionState.Terminated) {
            session.bye?.();
          }
        });
      }

      // Disconnect from SIP server if connected
      if (registerStatus === RegisterStatus.REGISTERED) {
        // The session manager should handle unregistration
      }

      await logout();
    } catch (error) {
      console.error("Error during signout:", error);
      // Still proceed with logout even if SIP disconnection fails
      await logout();
    }
  };

  const confirmSignout = () => {
    handleSignout();
  };

  return (
    <div
      key={refreshKey}
      className="w-full p-4 flex flex-col gap-4 bg-white border-b border-gray-100"
    >
      {/* Profile Section */}
      <div className="flex items-center">
        <div className="relative">
          <div className="rounded-full w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-sm flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* Status indicator */}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
              registerStatus === RegisterStatus.REGISTERED
                ? "bg-green-500"
                : "bg-gray-400"
            }`}
          />
        </div>
        <div className="min-w-0 flex-1 ml-3">
          <div className="flex gap-2 items-center">
            <div
              className={`w-4 h-4 flex items-center justify-center rounded-sm shadow-sm ${
                registerStatus === RegisterStatus.REGISTERED
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            >
              <PhoneIcon className="w-3 h-3 text-white" />
            </div>
            <p className="truncate text-sm font-semibold text-gray-900">
              {userDisplayText}
            </p>
          </div>
          <p className="truncate text-xs text-gray-500 mt-0.5 font-mono">
            {username}
          </p>
          {registerStatus === RegisterStatus.REGISTERED ? (
            <p className="truncate text-xs text-green-600 mt-0.5 font-medium">
              Online
            </p>
          ) : (
            <p className="truncate text-xs text-gray-600 mt-0.5 font-medium">
              Offline
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsShowSettingDialog(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors duration-200"
            title="Settings"
          >
            <Cog8ToothIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSignout()}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-1">
        {/* <button className="flex-1 p-2.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Search</span>
        </button> */}
        <button
          onClick={() => setPhoneState("dialing")}
          className="flex-1 p-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <PhoneIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Call</span>
        </button>
        {/* <button className="flex-1 p-2.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2">
          <UserPlusIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add</span>
        </button> */}
      </div>

      {/* Dialogs */}

      {!!phoneState && (
        <PhoneCallDialog
          isOpen={!!phoneState}
          onClose={() => setPhoneState(null)}
        />
      )}

      {isShowSettingDialog && (
        <SettingDialog
          isOpen={isShowSettingDialog}
          onClose={handleSettingsClose}
        />
      )}
    </div>
  );
}

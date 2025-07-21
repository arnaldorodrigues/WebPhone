'use client'

import { useAuth } from "@/contexts/AuthContext"
import { useSip } from "@/contexts/SipContext";
import { getUserData } from "@/core/users/request";
import { AppDispatch, RootState } from "@/store";
import { SipStatus } from "@/types/siptypes";
import { ArrowPathIcon, ArrowRightOnRectangleIcon, Cog8ToothIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SettingDialog from "./SettingDialog";
import PhoneCallDialog from "./PhoneCallDialog";

export const PhoneControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user, logout } = useAuth();
  const {
    connectAndRegister,
    disconnect,
    sipStatus,
    setPhoneState,
    phoneState,
  } = useSip();

  const hasAttemptedConnect = useRef(false);

  const { userData, loading, loaded } = useSelector((state: RootState) => state.userdata);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isShowSettingDialog, setIsShowSettingDialog] = useState<boolean>(false);

  const displayName = userData?.name || "User";
  const sipname = userData?.sipUsername || "";
  const userDisplayText = sipname ? `${displayName}` : "Not Configured";

  const handleRegisterToggle = async () => {
    try {
      if (sipStatus === SipStatus.REGISTERED) {
        await disconnect();
      } else {
        if (userData && !loading) {
          await connectAndRegister({
            wsServer: userData.wsServer,
            wsPort: userData.wsPort,
            wsPath: userData.wsPath,
            server: userData.domain,
            username: userData.sipUsername,
            password: userData.sipPassword,
            displayName: userData.name,
          });
        }
      }
    } catch (error) {
      console.error("Failed to toggle registration:", error);
    }
  };

  useEffect(() => {
    if (hasAttemptedConnect.current || !userData) return;

    if (userData &&
      userData.sipUsername &&
      userData.sipPassword &&
      userData.wsServer &&
      sipStatus !== SipStatus.REGISTERED
    ) {
      try {
        hasAttemptedConnect.current = true;
        connectAndRegister({
          wsServer: userData.wsServer,
          wsPort: userData.wsPort,
          wsPath: userData.wsPath,
          server: userData.domain,
          username: userData.sipUsername,
          password: userData.sipPassword,
          displayName: userData.name,
        });
      } catch (error) {
        console.error("Failed to connect and register", error);
      }
    }
  }, [userData])

  useEffect(() => {
    if (!user || !user?.userId) return;

    dispatch(getUserData(user.userId));
  }, [dispatch, user]);

  return (
    <div className="w-full p-5 flex flex-col gap-10 bg-white border-b border-gray-100">
      <div className="flex items-center">
        <div className="relative">
          <div className="rounded-full w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-sm flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user?.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm}
            ${(sipStatus === SipStatus.CONNECTED || sipStatus === SipStatus.REGISTERED) ? "bg-green-500" : "bg-gray-400"}`}
          />
        </div>
        <div className="min-w-0 flex-1 ml-3">
          <div className="flex gap-2 items-center">
            <div
              className={`w-4 h-4 flex items-center justify-center rounded-sm shadow-sm 
              ${sipStatus === SipStatus.REGISTERED
                  ? "bg-green-500"
                  : "bg-gray-400"
                }`}
            >
              <PhoneIcon className="w-3 h-3 text-white" />
            </div>
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.userName}
            </p>
          </div>
          <p className="truncate text-xs text-gray-500 mt-0.5 font-mono">
            {userDisplayText}
          </p>
          {sipStatus === SipStatus.REGISTERED ? (
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
            onClick={handleRegisterToggle}
            disabled={!userData || loading}
            className={`p-2 rounded-lg transition-colors duration-200 
              ${sipStatus === SipStatus.REGISTERED
                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              }`}
            title={
              sipStatus === SipStatus.REGISTERED
                ? "Unregister"
                : "Register"
            }
          >
            <ArrowPathIcon
              className={`w-5 h-5 transition-transform duration-300 ${refreshKey ? "rotate-180" : ""
                }`}
            />
          </button>
          <button
            onClick={() => setIsShowSettingDialog(true)}
            className="p-2 rounded-lg text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 transition-colors duration-200"
            title="Settings"
          >
            <Cog8ToothIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <button
          onClick={() => setPhoneState("dialing")}
          className="w-full p-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <PhoneIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Call</span>
        </button>
      </div>

      <PhoneCallDialog
        isOpen={!!phoneState}
        onClose={() => setPhoneState(null)}
      />

      <SettingDialog
        userData={userData}
        isOpen={isShowSettingDialog}
        onClose={() => setIsShowSettingDialog(false)}
      />
    </div>
  )
}
"use client";

import { useState } from "react";
import { PhoneCallDialog } from "@/components/feature/phone/dial/phone-call";
import { useSipContext } from "@/hooks/use-sip-context";
import {
  Cog8ToothIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import SettingDialog from "@/components/feature/setting/setting-dialog";
import { usePhoneState } from "@/hooks/use-phonestate-context";

export function Me() {
  const [isShowSettingDialog, setIsShowSettingDialog] = useState(false);
  const { callState, isInitialized, isConfigLoaded } = useSipContext();
  const { phoneState, setPhoneState } = usePhoneState();

  return (
    <div className="w-full p-4 flex flex-col gap-4 bg-white border-b border-gray-100">
      {/* Profile Section */}
      <div className="flex items-center">
        <div className="rounded-full w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 shadow-sm flex-shrink-0" />
        <div className="min-w-0 flex-1 ml-3">
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500 shadow-sm">
              <PhoneIcon className="w-3 h-3 text-white" />
            </div>
            <p className="truncate text-sm font-semibold text-gray-900">
              {isConfigLoaded ? "SIP User" : "Not Registered"}
            </p>
          </div>
          <p className="truncate text-sm text-gray-500 mt-0.5">
            {isInitialized ? "Registered" : "Not Registered"}
          </p>
        </div>
        <button
          onClick={() => setIsShowSettingDialog(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors duration-200"
        >
          <Cog8ToothIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-1">
        <button className="flex-1 p-2.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Search</span>
        </button>
        <button
          onClick={() => setPhoneState("dialing")}
          className="flex-1 p-2.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <PhoneIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Call</span>
        </button>
        <button className="flex-1 p-2.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2">
          <UserPlusIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add</span>
        </button>
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
          onClose={() => setIsShowSettingDialog(false)}
        />
      )}
    </div>
  );
}

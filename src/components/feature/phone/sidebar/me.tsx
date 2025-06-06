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

export function Me() {
  const [isShowPhoneCallDialog, setIsShowPhoneCallDialog] = useState(false);
  const [isShowSettingDialog, setIsShowSettingDialog] = useState(false);
  const { callState, isInitialized, isConfigLoaded } = useSipContext();

  return (
    <div className="w-full h-sm p-3 flex flex-col gap-3 bg-gray-100 shadow-sm">
      <div className="flex items-center">
        <div className="rounded-full w-14 h-14 mr-2 bg-blue-300" />
        <div className="min-w-0 flex-1">
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500">
              <PhoneIcon className="w-3 h-3 text-white" />
            </div>
            <p className="truncate text-sm font-semibold sm:text-base">
              {isConfigLoaded ? "SIP User" : "Not Registered"}
            </p>
          </div>
          <p className="truncate text-sm text-gray-500">
            {isInitialized ? "Registered" : "Not Registered"}
          </p>
        </div>
        <Cog8ToothIcon
          className="w-6 h-6 text-indigo-500 cursor-pointer"
          onClick={() => setIsShowSettingDialog(true)}
        />
      </div>
      <div className="px-3 py-1 flex gap-4 items-center">
        <MagnifyingGlassIcon className="w-5 h-5 text-indigo-500 cursor-pointer" />
        <PhoneIcon
          className="w-4 h-4 text-indigo-500 cursor-pointer"
          onClick={() => {
            setIsShowPhoneCallDialog(true);
          }}
        />
        <UserPlusIcon className="w-5 h-5 text-indigo-500 cursor-pointer" />
      </div>
      {isShowPhoneCallDialog && (
        <PhoneCallDialog
          isOpen={isShowPhoneCallDialog}
          onClose={() => setIsShowPhoneCallDialog(false)}
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

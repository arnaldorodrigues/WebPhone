'use client'

import { ChatBoard, ContactsList, PhoneControl } from "@/components/phone";
import { useSip } from "@/contexts/SipContext";
import { useSmsSocket } from "@/contexts/SmsContext";
import { RootState } from "@/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const PhoneHome = () => {
  const { selectedContact } = useSelector((state: RootState) => state.contactsdata);

  const { subscribe } = useSmsSocket();
  const { showNotification } = useSip();

  useEffect(() => {
    const unsubscribe = subscribe((wsMessage: any) => {
      if (
        wsMessage?.type === "new_sms" &&
        wsMessage?.messageId &&
        wsMessage?.body &&
        wsMessage?.from &&
        wsMessage?.timestamp
      ) {
        showNotification({
          title: "New SMS",
          message: `New SMS from ${wsMessage.from}`,
          type: "info"
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  return (
    <div className="w-full h-full flex-1 flex flex-row ">
      <div className="w-full h-[calc(100vh-4rem)] pb-5 sm:block sm:w-80 bg-white border-r border-gray-100 shadow-sm">
        <div className="h-full flex flex-col">
          <PhoneControl />
          <ContactsList />
        </div>
      </div>
      <div className="flex-1">
        {selectedContact && <ChatBoard />}
      </div>
    </div>
  )
}

export default PhoneHome;
'use client'

import { ChatBoard, ContactsList, PhoneControl } from "@/components/phone";
import { useSip } from "@/contexts/SipContext";
import { useSmsSocket } from "@/contexts/SmsContext";
import { RootState } from "@/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const PhoneHome = () => {
  const { selectedContact } = useSelector((state: RootState) => state.contactsdata);

  const { subscribe, addSmsMessage } = useSmsSocket();
  const { showNotification } = useSip();

  const sidebarVisible = selectedContact !== undefined;

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

        addSmsMessage({
          type: wsMessage?.type,
          messageId: wsMessage?.messageId,
          body: wsMessage?.body,
          from: wsMessage?.from,
          timestamp: wsMessage?.timestamp
        })
  }
    });

return () => {
  unsubscribe();
};
  }, [subscribe]);

return (
  <div className="w-full h-full flex-1 flex flex-row ">
    <div className={`w-full h-[calc(100vh-4rem)] pb-5 sm:block sm:w-80 bg-white border-r border-gray-100 shadow-sm ${sidebarVisible && "hidden"}`}>
      <div className="h-full flex flex-col">
        <PhoneControl />
        <ContactsList />
      </div>
    </div>
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col justify-between bg-blue-50">
      {selectedContact && <ChatBoard />}
    </div>
  </div>
)
}

export default PhoneHome;
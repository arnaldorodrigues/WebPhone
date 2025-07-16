'use client'

import { ChatBoard, ContactsList, PhoneControl } from "@/components/phone";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const PhoneHome = () => {
  const { selectedContact } = useSelector((state: RootState) => state.contactsdata);

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
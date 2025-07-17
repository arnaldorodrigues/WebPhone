import React, { useState } from "react";
import { ChatTitle } from "./ChatTitle";
import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { ContactType } from "@/types/common";
import { useSip } from "@/contexts/SipContext";
import { sendMessage } from "@/core/messages/request";

export const ChatBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { messages, selectedContact } = useSelector((state: RootState) => state.contactsdata);
  const { userData } = useSelector((state: RootState) => state.userdata);

  const { sessionManager } = useSip();


  const [chatInput, setChatInput] = useState<string>("");

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedContact) return;

    try {
      if (selectedContact.contactType === ContactType.WEBRTC) {
        if (!sessionManager) return;

        await sessionManager.message(
          `sip:${selectedContact.number}@${userData?.domain}`,
          text
        );

        dispatch(sendMessage({
          to: selectedContact.id,
          message: text
        }));
      } else {
        

        dispatch(sendMessage({
          to: selectedContact.id,
          message: text
        }));
      }
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col justify-between bg-blue-50">
      <ChatTitle contact={selectedContact} />
      <ChatHistory messages={messages} />
      <ChatInput
        messageValue={chatInput}
        setMessageValue={setChatInput}
        onEnter={() => {
          if (!chatInput.trim()) return;
          handleSendMessage(chatInput);
          setChatInput("")
        }}
      />
    </div>
  )
}
import React, { useState } from "react";
import { ChatTitle } from "./ChatTitle";
import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const ChatBoard: React.FC = () => {
  const { messages, selectedContact } = useSelector((state: RootState) => state.contactsdata);
  
  const [chatInput, setChatInput] = useState<string>("");

  const handleSendMessage = async (text: string) => {

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
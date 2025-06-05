"use client";

import { useState } from "react";
import Title from "@/components/feature/phone/title";
import ChatInput from "@/components/feature/phone/chat-input";
import ChatBoard from "@/components/feature/phone/chat-board";

const Page = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    Array<{ text: string; date: string; isMe: boolean } | null>
  >([]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-blue-100">
      <Title />
      <div className="flex-1">
        <ChatBoard
          chatHistory={
            chatHistory as [
              { text: string; date: string; isMe: boolean } | null
            ]
          }
        />
      </div>
      <ChatInput
        value={chatInput}
        setValue={setChatInput}
        onEnter={() => {
          setChatInput("");
          if (!chatInput || chatInput.trim().length === 0) return;
          setChatHistory([
            ...chatHistory,
            { text: chatInput, date: "2025-06-05", isMe: Math.random() < 0.5 },
          ]);
        }}
      />
    </div>
  );
};

export default Page;

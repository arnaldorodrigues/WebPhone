"use client";

import { useState } from "react";
import Title from "@/components/feature/dashboard/title";
import ChatInput from "@/components/feature/dashboard/chat-input";

const Page = () => {
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="w-full h-full flex flex-col justify-between bg-blue-100">
      <Title />
      <ChatInput
        value={chatInput}
        setValue={setChatInput}
        onEnter={() => {
          setChatInput("");
          console.log(chatInput);
        }}
      />
    </div>
  );
};

export default Page;

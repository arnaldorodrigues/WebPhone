"use client";

import { useState, useEffect } from "react";
import Title from "@/components/feature/phone/title";
import ChatInput from "@/components/feature/phone/chat-input";
import ChatBoard from "@/components/feature/phone/chat-board";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { useUserData } from "@/hooks/use-userdata";
import { fetchWithAuth } from "@/utils/api";
import { addContact } from "@/lib/contact-action";
import { useParams } from "next/navigation";
import { readMessage } from "@/lib/message-action";

const Page = () => {
  const params = useParams();
  const { sessionManager, messages: sipMessages } = useSIPProvider();
  const { userData, refreshUserData } = useUserData();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchMessages();
  }, [sipMessages]);

  // Save message to database and send via SIP
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !sessionManager || !userData.settings?.sipUsername)
      return;

    try {
      const contact = userData.contacts.find(
        (contact) => contact.id === params.id
      );

      if (!contact) {
        return;
      }

      // Send message via SIP
      if (sessionManager) {
        await sessionManager.message(
          `sip:${contact.number}@${userData.settings.domain}`,
          text
        );
      }

      // Save message to database
      const response = await fetchWithAuth("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          to: params.id,
          messageBody: text,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      //Get messages related to me
      const response = await fetchWithAuth(
        `/api/messages?contact=${params.id}`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
        data.data.forEach(async (message: any) => {
          await readMessage(message._id);
        });
      }

      refreshUserData();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col justify-between bg-blue-50">
      <Title />
      <ChatBoard messages={messages} currentUser={userData?.id || ""} />
      <ChatInput
        value={chatInput}
        setValue={setChatInput}
        onEnter={() => {
          if (!chatInput.trim()) return;
          handleSendMessage(chatInput);
          setChatInput("");
        }}
      />
    </div>
  );
};

export default Page;

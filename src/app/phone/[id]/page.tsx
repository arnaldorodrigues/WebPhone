"use client";

import { useState, useEffect } from "react";
import Title from "@/components/feature/phone/title";
import ChatInput from "@/components/feature/phone/chat-input";
import ChatBoard from "@/components/feature/phone/chat-board";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { useUserData } from "@/hooks/use-userdata";
import { fetchWithAuth } from "@/utils/api";
import { useParams } from "next/navigation";
import { readMessage } from "@/lib/message-action";
import { fetchSMSMessages, sendSMS } from "@/lib/message-action";

interface Message {
  _id: string;
  body: string;
  from: string;
  to: string;
  timestamp: string;
  type?: "chat" | "sms";
}

const Page = () => {
  const params = useParams();
  const { sessionManager, messages: sipMessages } = useSIPProvider();
  const { userData, refreshUserData } = useUserData();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSMSMode, setIsSMSMode] = useState(false);

  useEffect(() => {
    // Check if this is a SMS contact (number) or a chat contact (id)
    const isSMS = !userData?.contacts?.some(
      (contact) => contact.id === params.id
    );
    setIsSMSMode(isSMS);

    if (isSMS) {
      fetchSMSConversation();
    } else {
      fetchChatMessages();
    }
  }, [params.id, sipMessages]);

  const fetchSMSConversation = async () => {
    const smsMessages = await fetchSMSMessages(params.id as string);
    setMessages(smsMessages);
  };

  const fetchChatMessages = async () => {
    try {
      const response = await fetchWithAuth(
        `/api/messages?contact=${params.id}`
      );
      const data = await response.json();

      if (data.success) {
        const chatMessages: Message[] = data.data.map((msg: any) => ({
          ...msg,
          type: "chat" as const,
        }));
        setMessages(chatMessages);
        data.data.forEach(async (message: any) => {
          await readMessage(message._id);
        });
      }

      refreshUserData();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      if (isSMSMode) {
        const sentMessage = await sendSMS(params.id as string, text);
        if (sentMessage) {
          setMessages((prev) => [...prev, sentMessage as Message]);
        }
      } else {
        if (!sessionManager || !userData.settings?.sipUsername) return;

        const contact = userData.contacts.find(
          (contact) => contact.id === params.id
        );

        if (!contact) return;

        if (sessionManager) {
          await sessionManager.message(
            `sip:${contact.number}@${userData.settings.domain}`,
            text
          );
        }

        const response = await fetchWithAuth("/api/messages", {
          method: "POST",
          body: JSON.stringify({
            to: params.id,
            messageBody: text,
          }),
        });

        const data = await response.json();
        if (data.success) {
          const newMessage: Message = {
            ...data.data,
            type: "chat",
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const myId = isSMSMode ? process.env.SIGNALWIRE_PHONE_NUMBER : userData?.id;

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col justify-between bg-blue-50">
      <Title isSMS={isSMSMode} />
      <ChatBoard messages={messages} currentUser={myId || ""} />
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

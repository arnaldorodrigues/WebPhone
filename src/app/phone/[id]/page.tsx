"use client";

import { useState, useEffect } from "react";
import Title from "@/components/feature/phone/title";
import ChatInput from "@/components/feature/phone/chat-input";
import ChatBoard from "@/components/feature/phone/chat-board";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { useUserData } from "@/hooks/use-userdata";
import { fetchWithAuth } from "@/utils/api";
import { useParams } from "next/navigation";
import {
  readMessage,
  sendMessage,
  sendSMSMessage,
  getGatewayNumber,
} from "@/lib/message-action";

interface Message {
  _id: string;
  body: string;
  from: string;
  to: string;
  timestamp: string;
}

const Page = () => {
  const params = useParams();
  const { sessionManager, messages: sipMessages } = useSIPProvider();
  const { userData, refreshUserData } = useUserData();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSMSMode, setIsSMSMode] = useState(false);
  const [gatewayNumber, setGatewayNumber] = useState<string | null>(null);

  useEffect(() => {
    const decodedId = decodeURIComponent(params.id as string);
    if (decodedId.startsWith("+")) {
      setIsSMSMode(true);
      // Fetch gateway number when in SMS mode
      getGatewayNumber().then((number) => {
        if (number) setGatewayNumber(number);
      });
    }

    fetchChatMessages();
  }, [params.id, sipMessages]);

  const fetchChatMessages = async () => {
    try {
      const decodedId = decodeURIComponent(params.id as string);

      const response = await fetchWithAuth(
        `/api/messages?contact=${decodedId}`
      );
      const data = await response.json();

      if (data.success) {
        const chatMessages: Message[] = data.data;
        setMessages(chatMessages);
        chatMessages.forEach(async (message: Message) => {
          if (message.from !== userData?.id) {
            await readMessage(message._id);
          }
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
      const decodedId = decodeURIComponent(params.id as string);
      if (isSMSMode) {
        const sentMessage = await sendSMSMessage(decodedId, text);
        if (sentMessage) {
          setMessages((prev) => [...prev, sentMessage as Message]);
        }
      } else {
        const sentMessage = await sendMessage(
          decodedId,
          text,
          sessionManager,
          userData?.settings?.domain || ""
        );
        if (sentMessage) {
          setMessages((prev) => [...prev, sentMessage as Message]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const myId = isSMSMode ? gatewayNumber : userData?.id;

  if (isSMSMode && !gatewayNumber) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-blue-50">
        Loading SMS configuration...
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col justify-between bg-blue-50">
      <Title />
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

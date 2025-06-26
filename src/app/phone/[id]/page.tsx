"use client";

import { useState, useEffect } from "react";
import Title from "@/components/feature/phone/title";
import ChatInput from "@/components/feature/phone/chat-input";
import ChatBoard from "@/components/feature/phone/chat-board";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { useUserData } from "@/hooks/use-userdata";
import { useParams } from "next/navigation";
import {
  readMessage,
  sendMessage,
  sendSMSMessage,
  fetchMessage,
} from "@/lib/message-action";
import { useWebSocket } from "@/contexts/websocket-context";
import { addContact } from "@/lib/contact-action";

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
  const { subscribe } = useWebSocket();
  const { userData, refreshUserData } = useUserData();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSMSMode, setIsSMSMode] = useState(false);
  const [didId, setDidId] = useState<string | null>(null);
  const [wsMessages, setWsMessages] = useState<any[]>([]);

  useEffect(() => {
    const decodedId = decodeURIComponent(params.id as string);

    if (!/^[a-f\d]{24}$/i.test(decodedId)) {
      setIsSMSMode(true);
      setDidId(userData?.did?._id?.toString() || null);
    }
  }, [userData, params.id]);

  useEffect(() => {
    fetchChatMessages();
    refreshUserData();
  }, [params.id, wsMessages, refreshUserData]);

  useEffect(() => {
    const unsubscribe = subscribe((wsMessage: any) => {
      setWsMessages((prev) => [...prev, wsMessage]);
    });
    return () => {
      unsubscribe();
    };
  }, [subscribe, setWsMessages]);

  const fetchChatMessages = async () => {
    try {
      const decodedId = decodeURIComponent(params.id as string);

      const messages = await fetchMessage(decodedId);

      if (messages) {
        const chatMessages: Message[] = messages;
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
        const contact = userData.contacts.find(
          (contact) => contact.id === decodedId
        );

        if (!contact) {
          return;
        }
        const sentMessage = await sendMessage(
          contact,
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

  const myId = isSMSMode ? didId : userData?.id;

  if (isSMSMode && !didId) {
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
          refreshUserData();
          setChatInput("");
        }}
      />
    </div>
  );
};

export default Page;

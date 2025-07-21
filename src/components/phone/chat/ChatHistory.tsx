'use client'

import { IMessageItem } from "@/core/messages/model"
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  messages: IMessageItem[];
}

export const ChatHistory: React.FC<Props> = ({
  messages
}) => {
  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messageGroups, setMessageGroups] = useState<any[]>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const messageGroups = messages.reduce<{
      date: string, messages: IMessageItem[]
    }[]>((groups, message) => {
      const messageDate = format(new Date(message.timestamp), "yyyy-MM-dd");
      const existingGroup = groups.find((group) => group.date === messageDate);

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: messageDate, messages: [message] });
      }

      return groups;
    }, []);

    setMessageGroups(messageGroups);
  }, [messages])

  useEffect(() => {
    scrollToBottom();
  }, [messageGroups])

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-4">
      {messageGroups?.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-center my-6">
            <div className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-medium">
              {group.date}
            </div>
          </div>
          <div className="space-y-4">
            {group.messages.map(
              (message: IMessageItem, idx: number) =>
                message.body &&
                message.body.length > 0 && (
                  <div key={idx} className={`w-full flex ${message.from === user?.userId ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xl p-4 rounded-2xl break-words shadow-sm
                        ${message.from === user?.userId
                          ? "bg-indigo-500 text-white"
                          : "bg-white text-gray-900 border border-gray-100"
                        }
                      `}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
                      <div className="mt-2 flex justify-end">
                        <p
                          className={`text-xs ${message.from === user?.userId ? "text-indigo-100" : "text-gray-400"}`}
                        >
                          {format(new Date(message.timestamp), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
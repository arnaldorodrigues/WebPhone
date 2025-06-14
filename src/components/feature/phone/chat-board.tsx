import { useEffect, useRef } from "react";
import { format } from "date-fns";
import ChatUnit from "./chat-unit";

interface Message {
  _id: string;
  body: string;
  from: string;
  to: string;
  timestamp: string;
}

interface ChatBoardProps {
  messages: Message[];
  currentUser: string;
}

const ChatBoard = ({ messages, currentUser }: ChatBoardProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages?.map((message) => (
        <ChatUnit
          key={message._id + message.body + message.timestamp}
          text={message.body}
          date={format(new Date(message.timestamp), "HH:mm")}
          isMe={message.from === currentUser}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBoard;

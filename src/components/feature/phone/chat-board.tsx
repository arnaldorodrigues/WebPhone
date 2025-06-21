import { useEffect, useRef } from "react";
import { format, isSameDay } from "date-fns";
import ChatUnit from "./chat-unit";
import ChatDateHeader from "./chat-date-header";

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

  const messageGroups = messages?.reduce<
    { date: string; messages: Message[] }[]
  >((groups, message) => {
    const messageDate = format(new Date(message.timestamp), "yyyy-MM-dd");
    const existingGroup = groups.find((group) => group.date === messageDate);

    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date: messageDate, messages: [message] });
    }

    return groups;
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-20 space-y-4">
      {messageGroups?.map((group) => (
        <div key={group.date}>
          <ChatDateHeader date={group.date} />
          <div className="space-y-4">
            {group.messages.map((message) => (
              <ChatUnit
                key={message._id + message.body + message.timestamp}
                text={message.body}
                date={format(new Date(message.timestamp), "HH:mm")}
                isMe={message.from === currentUser}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBoard;

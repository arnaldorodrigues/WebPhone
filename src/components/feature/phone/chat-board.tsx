import ChatUnit from "./chat-unit";

const ChatBoard = ({
  chatHistory,
}: {
  chatHistory: [{ text: string; date: string; isMe: boolean } | null];
}) => {
  return (
    <div className="w-full h-full flex flex-col p-3 gap-3 overflow-y-auto overflow-x-clip bg-transparent">
      {chatHistory &&
        chatHistory.map(
          (chat, index) =>
            chat && (
              <ChatUnit
                text={chat.text}
                date={chat.date}
                isMe={chat.isMe}
                key={chat.text + chat.date}
              />
            )
        )}
    </div>
  );
};

export default ChatBoard;

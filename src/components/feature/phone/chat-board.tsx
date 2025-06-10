import ChatUnit from "./chat-unit";

const ChatBoard = ({
  chatHistory,
}: {
  chatHistory: [{ text: string; date: string; isMe: boolean } | null];
}) => {
  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto overflow-x-clip bg-gray-50">
      <div className="flex-1 min-h-0">
        <div className="space-y-4">
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
      </div>
    </div>
  );
};

export default ChatBoard;

const ChatUnit = ({
  text,
  date,
  isMe,
}: {
  text: string;
  date: string;
  isMe: boolean;
}) => {
  return (
    <div className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-xl p-4 rounded-2xl break-words shadow-sm
          ${
            isMe
              ? "bg-indigo-500 text-white"
              : "bg-white text-gray-900 border border-gray-100"
          }
        `}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        <div className="mt-2 flex justify-end">
          <p
            className={`text-xs ${isMe ? "text-indigo-100" : "text-gray-400"}`}
          >
            {date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatUnit;

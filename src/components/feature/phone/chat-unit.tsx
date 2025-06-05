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
        className={`max-w-md p-3 rounded-md break-words ${
          isMe ? "bg-indigo-200" : "bg-green-200"
        }`}
      >
        <p className="text-sm font-semibold">{text}</p>
        <div className="mt-2 flex">
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatUnit;

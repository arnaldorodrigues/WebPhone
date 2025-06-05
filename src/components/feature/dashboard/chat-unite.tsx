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
    <div
      className={`w-full flex ${
        isMe ? "justify-end" : "justify-start"
      } bg-amber-300`}
    >
      <div
        className={`max-w-4xl rounded-md flex ${
          isMe ? "bg-white" : "bg-green-200"
        }`}
      >
        <p className="text-sm font-semibold">{text}</p>
      </div>
    </div>
  );
};

export default ChatUnit;

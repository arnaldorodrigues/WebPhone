import { format } from "date-fns";

interface ChatDateHeaderProps {
  date: string;
}

const ChatDateHeader = ({ date }: ChatDateHeaderProps) => {
  const formattedDate = format(
    new Date(date + "T00:00:00"),
    "EEEE, MMMM d, yyyy"
  );

  return (
    <div className="flex items-center justify-center my-6">
      <div className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-medium">
        {formattedDate}
      </div>
    </div>
  );
};

export default ChatDateHeader;

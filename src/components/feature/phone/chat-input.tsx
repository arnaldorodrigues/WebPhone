import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

import PlainText from "@/components/ui/inputs/plaintext";

interface Props {
  value: string;
  setValue: (s: string) => void;
  onEnter: () => void;
}

const ChatInput = ({ value, setValue, onEnter }: Props) => {
  const handleChange = (s: string) => {
    setValue(s);
  };

  return (
    <div className="w-full p-4 bg-white border-t border-gray-100">
      <div className="flex items-start gap-3">
        {/* <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors duration-200">
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button> */}
        <div className="flex-1">
          <PlainText
            id="chat_input"
            name="chat_input"
            placeholder="Type your message here..."
            value={value}
            rows={1}
            onChange={handleChange}
            onEnter={onEnter}
          />
        </div>
        <button
          onClick={onEnter}
          disabled={!value.trim()}
          className="p-2 rounded-lg text-indigo-500 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

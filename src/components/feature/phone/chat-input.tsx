import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import PlainText from "@/components/ui/inputs/plaintext";

interface Props {
  value: string;
  setValue: (s: string) => void;
  onEnter: () => void;
}

const ChatInput = ({ value, setValue, onEnter }: Props) => {
  return (
    <div className="w-full min-h-8 p-3 flex gap-3 bg-gray-100 shadow-sm">
      <EllipsisHorizontalIcon className="w-6 h-6 cursor-pointer text-indigo-500" />
      <PlainText
        id="chat_input"
        name="chat_input"
        placeholder="Type your message here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onEnter={onEnter}
      />
    </div>
  );
};

export default ChatInput;

import { PlainText } from "@/components/ui/inputs"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"

type Props = {
  messageValue: string;
  setMessageValue: (s: string) => void;
  onEnter: () => void;
}

export const ChatInput: React.FC<Props> = ({
  messageValue,
  setMessageValue,
  onEnter
}) => {
  return (
    <div className="w-full p-4 bg-white border-t border-gray-100">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <PlainText
            id="chat_input"
            name="chat_input"
            placeholder="Type your message here..."
            value={messageValue}
            rows={1}
            onChange={(s) => setMessageValue(s)}
            onEnter={onEnter}
          />
        </div>
        <button
          onClick={onEnter}
          disabled={!messageValue.trim()}
          className="p-2 rounded-lg text-indigo-500 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
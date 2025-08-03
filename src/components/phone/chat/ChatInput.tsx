import { PlainText } from "@/components/ui/inputs"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import { CheckCircleIcon } from "@heroicons/react/24/solid"

type Props = {
  messageValue: string;
  setMessageValue: (s: string) => void;
  onEnter: () => void;
  isSending?: boolean;
  sendSuccess?: boolean;
}

export const ChatInput: React.FC<Props> = ({
  messageValue,
  setMessageValue,
  onEnter,
  isSending = false,
  sendSuccess = false
}) => {
  return (
    <div className="w-full p-4 bg-white border-t border-gray-100">
      <div className="flex flex-col w-full">
        {/* Status messages */}
        {isSending && (
          <div className="text-sm text-gray-500 mb-2">
            Sending message...
          </div>
        )}
        {sendSuccess && (
          <div className="text-sm text-green-500 mb-2 flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Message sent successfully!
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <PlainText
              id="chat_input"
              name="chat_input"
              placeholder="Type your message here..."
              value={messageValue}
              rows={1}
              onChange={(s) => setMessageValue(s)}
              onEnter={() => {
                if (!isSending) onEnter();
              }}
            />
          </div>
          <button
            onClick={onEnter}
            disabled={!messageValue.trim() || isSending}
            className="p-2 rounded-lg text-indigo-500 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
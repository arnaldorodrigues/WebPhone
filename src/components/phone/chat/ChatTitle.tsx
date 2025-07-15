import { IContactItem } from "@/core/contacts/model"
import { ContactType } from "@/types/common";

type Props = {
  contact: IContactItem | undefined;
}

export const ChatTitle: React.FC<Props> = ({
  contact
}) => {
  const isSMS = contact?.contactType === ContactType.SMS;
  const displayName = contact?.name || "";
  const displayNumber = contact?.number || "";

  return (
    <div className="w-full p-4 flex gap-4 shadow-sm bg-white border-b border-gray-100">
      <div className="relative">
        <div className="rounded-full w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-sm flex items-center justify-center">
          <span className="text-white text-lg font-semibold">
            {!isSMS && (displayName[0]?.toUpperCase() || "?")}
          </span>
        </div>
        {isSMS && (
          <div className="absolute -top-1 -right-1">
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded-full">
              SMS
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-1 gap-2 items-center">
          <p
            className={`truncate text-lg font-medium text-gray-900 ${isSMS ? "font-mono" : ""
              }`}
          >
            {displayName}
          </p>
        </div>
        {!isSMS && (
          <p className="truncate flex-1 text-sm text-gray-500">
            {displayNumber}
          </p>
        )}
      </div>
    </div>
  )
}
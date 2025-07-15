import { IContactItem } from "@/core/contacts/model";
import { ContactType } from "@/types/common";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Props = {
  contact: IContactItem;
  isSelected: boolean;
  onSelect: (item: IContactItem) => void
}

const ContactCard: React.FC<Props> = ({
  contact,
  isSelected,
  onSelect
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  return (
    <div
      className={`w-full p-3 flex rounded-lg gap-3 border-l-4 border-transparent hover:bg-gray-100 transition-all duration-200 ease-in-out group ${isSelected ? "border-indigo-500! bg-blue-50" : ""}`}
      onClick={() => onSelect(contact)}
    >
      <div className="relative">
        <div className="rounded-full w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-sm flex-shrink-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {contact.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        {contact.contactType === ContactType.WEBRTC && (
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
        )}
        {contact.contactType === ContactType.SMS && (
          <div className="absolute -top-1 -right-1">
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded-full">
              SMS
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex gap-2 items-center">
          <p
            className={`truncate font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 ${isSelected ? "text-indigo-600" : ""
              } ${contact.contactType === ContactType.WEBRTC ? "text-xl font-mono" : "text-lg"}`}
          >
            {contact.name || contact.number}
          </p>
          {contact.unreadCount && contact.unreadCount > 0 && (
            <div className="ml-auto flex-shrink-0">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full">
                {contact.unreadCount}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 justify-between mt-1">
          <p className="truncate flex-1 text-sm text-gray-500">
            {contact.contactType === ContactType.WEBRTC && contact.number}
          </p>
        </div>
      </div>
      <button
        onClick={() => { }}
        className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        title="Delete Contact"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  )
}

export default ContactCard;
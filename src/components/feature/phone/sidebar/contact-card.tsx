import { PhoneIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useEffect, useState } from "react";
import { checkExtensionNumberIsRegistered } from "@/lib/contact-action";

interface Contact {
  id: string;
  name: string;
  number: string;
  unreadCount?: number;
  type: "chat" | "sms";
}

const ContactCard = ({
  contact,
  isSelected,
}: {
  contact: Contact;
  isSelected: boolean;
}) => {
  const { id, name, number, unreadCount = 0, type } = contact;
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (type === "chat") {
      const interval = setInterval(async () => {
        const isRegistered = await checkExtensionNumberIsRegistered(number);
        setIsOnline(isRegistered || false);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [type, number]);

  return (
    <Link
      href={`/phone/${id}`}
      className={`w-full p-3 flex rounded-lg gap-3 border-l-4 border-transparent hover:bg-gray-100 transition-all duration-200 ease-in-out group ${
        isSelected ? "border-indigo-500! bg-blue-50" : ""
      }`}
    >
      <div className="relative">
        <div className="rounded-full w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-sm flex-shrink-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {name?.charAt(0).toUpperCase()}
          </span>
        </div>
        {type === "chat" && (
          <div
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        )}
        {type === "sms" && (
          <div className="absolute -top-1 -right-1">
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full">
              SMS
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex gap-2 items-center">
          <p
            className={`truncate font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 ${
              isSelected ? "text-indigo-600" : ""
            }`}
          >
            {name || number}
          </p>
          {unreadCount > 0 && (
            <div className="ml-auto flex-shrink-0">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full">
                {unreadCount}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 justify-between mt-1">
          <p className="truncate flex-1 text-sm text-gray-500">{number}</p>
        </div>
      </div>
    </Link>
  );
};

export default ContactCard;

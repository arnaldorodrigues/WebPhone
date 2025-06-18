import { PhoneIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { Contact } from "@/types/user";
import { useEffect, useState } from "react";
import { checkExtensionNumberIsRegistered } from "@/lib/contact-action";

const ContactCard = ({
  contact,
  isSelected,
}: {
  contact: Contact;
  isSelected: boolean;
}) => {
  const { id, name, number, unreadCount = 0 } = contact;
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const isRegistered = await checkExtensionNumberIsRegistered(number);
      setIsOnline(isRegistered || false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href={`/phone/${id}`}
      className={`w-full p-3 flex rounded-lg gap-3 border-l-4 border-transparent hover:border-indigo-500 hover:bg-gray-100 transition-all duration-200 ease-in-out group ${
        isSelected ? "border-indigo-500! bg-blue-50" : ""
      }`}
    >
      <div className="relative">
        <div className="rounded-full w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 shadow-sm flex-shrink-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex gap-2 items-center">
          <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500 shadow-sm">
            <PhoneIcon className="w-3 h-3 text-white" />
          </div>
          <p
            className={`truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 ${
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

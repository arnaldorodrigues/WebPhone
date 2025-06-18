import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserData } from "@/hooks/use-userdata";

import { PhoneIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";

const Title = () => {
  const { id } = useParams();
  const { userData } = useUserData();

  const currentContact = userData.contacts.find((contact) => contact.id === id);

  return (
    <div className="w-full p-4 flex gap-4 shadow-sm bg-white border-b border-gray-100">
      <div className="flex-1 flex items-center gap-4">
        <Link
          href={"/phone"}
          className="cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors duration-200"
        >
          <ChevronLeftIcon className="w-6 h-6 text-indigo-500" />
        </Link>
        <div className="rounded-full w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 shadow-sm flex items-center justify-center">
          <span className="text-white text-lg font-semibold">
            {currentContact?.name
              ? currentContact.name.charAt(0).toUpperCase()
              : "?"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-1 gap-2 items-center">
            <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500 shadow-sm">
              <PhoneIcon className="w-3 h-3 text-white" />
            </div>
            <p className="truncate text-sm font-semibold sm:text-base text-gray-900">
              {currentContact ? `${currentContact.name}` : "Unknown Contact"}
            </p>
          </div>
          <p className="truncate flex-1 text-sm text-gray-500">
            {currentContact ? `${currentContact.number}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Title;

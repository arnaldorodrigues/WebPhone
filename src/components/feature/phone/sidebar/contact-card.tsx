import { PhoneIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const ContactCard = () => {
  return (
    <Link
      href={"/phone/1"}
      className="w-full p-3 flex rounded-lg gap-3 border-l-4 border-transparent hover:border-indigo-500 hover:bg-gray-100 transition-all duration-200 ease-in-out group"
    >
      <div className="rounded-full w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 shadow-sm flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex gap-2 items-center">
          <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500 shadow-sm">
            <PhoneIcon className="w-3 h-3 text-white" />
          </div>
          <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
            100-Conrad de Wet
          </p>
        </div>
        <div className="flex flex-1 justify-between mt-1">
          <p className="truncate flex-1 text-sm text-gray-500">Registered</p>
          <p className="truncate text-sm text-gray-400 ml-2">2025-06-04</p>
        </div>
      </div>
    </Link>
  );
};

export default ContactCard;

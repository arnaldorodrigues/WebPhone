import { PhoneIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const ContactCard = () => {
  return (
    <Link
      href={"/dashboard/1"}
      className="w-full p-2 flex rounded-md gap-3 hover:bg-gray-300 hover:border-indigo-500 hover:border-0 hover:border-l-4 cursor-pointer"
    >
      <div className="rounded-full w-13 h-13 mr-1 bg-green-300" />
      <div className="min-w-0 flex-1">
        <div className="flex gap-1 items-center">
          <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500">
            <PhoneIcon className="w-3 h-3 text-white" />
          </div>
          <p className="truncate text-sm font-semibold sm:text-base">
            100-Conrad de Wet
          </p>
        </div>
        <div className="flex flex-1 justify-between">
          <p className="truncate flex-1 text-sm text-gray-500">Registered</p>
          <p className="truncate text-sm text-gray-500 ">2025-06-04</p>
        </div>
      </div>
    </Link>
  );
};

export default ContactCard;

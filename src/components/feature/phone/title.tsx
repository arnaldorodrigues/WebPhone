import Link from "next/link";

import {
  PhoneIcon,
  ChevronLeftIcon,
  VideoCameraIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const Title = () => {
  return (
    <div className="w-full p-4 flex gap-4 shadow-sm bg-white border-b border-gray-100">
      <div className="flex-1 flex items-center gap-4">
        <Link
          href={"/phone"}
          className="cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors duration-200"
        >
          <ChevronLeftIcon className="w-6 h-6 text-indigo-500" />
        </Link>
        <div className="rounded-full w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 shadow-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-1 gap-2 items-center">
            <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500 shadow-sm">
              <PhoneIcon className="w-3 h-3 text-white" />
            </div>
            <p className="truncate text-sm font-semibold sm:text-base text-gray-900">
              100-Conrad de Wet
            </p>
          </div>
          <p className="truncate flex-1 text-sm text-gray-500">Registered</p>
        </div>
      </div>
      <div className="flex gap-6 items-center text-gray-400">
        <button className="hover:text-indigo-500 transition-colors duration-200">
          <PhoneIcon className="w-5 h-5" />
        </button>
        <button className="hover:text-indigo-500 transition-colors duration-200">
          <VideoCameraIcon className="w-5 h-5" />
        </button>
        <button className="hover:text-indigo-500 transition-colors duration-200">
          <PencilIcon className="w-5 h-5" />
        </button>
        <button className="hover:text-indigo-500 transition-colors duration-200">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
        <button className="hover:text-red-500 transition-colors duration-200">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Title;

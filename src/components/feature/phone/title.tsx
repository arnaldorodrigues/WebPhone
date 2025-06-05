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
    <div className="w-full p-3 flex gap-3 shadow-md bg-gray-100">
      <div className="flex-1 flex items-center gap-4">
        <Link href={"/phone"} className="cursor-pointer">
          <ChevronLeftIcon className="w-8 h-8 text-indigo-500" />
        </Link>
        <div className="rounded-full w-13 h-13 bg-green-300" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-1 gap-1 items-center">
            <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-green-500">
              <PhoneIcon className="w-3 h-3 text-white" />
            </div>
            <p className="truncate text-sm font-semibold sm:text-base">
              100-Conrad de Wet
            </p>
          </div>
          <p className="truncate flex-1 text-sm text-gray-500">Registered</p>
        </div>
      </div>
      <div className="flex gap-5 items-center text-indigo-500">
        <PhoneIcon className="w-4 h-4 cursor-pointer" />
        <VideoCameraIcon className="w-5 h-5 cursor-pointer" />
        <PencilIcon className="w-4 h-4 cursor-pointer" />
        <MagnifyingGlassIcon className="w-5 h-5 cursor-pointer" />
        <TrashIcon className="w-5 h-5 cursor-pointer" />
      </div>
    </div>
  );
};

export default Title;

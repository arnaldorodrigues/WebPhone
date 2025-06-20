import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserData } from "@/hooks/use-userdata";
import { PhoneIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";

interface TitleProps {
  isSMS?: boolean;
}

const Title = ({ isSMS = false }: TitleProps) => {
  const { id } = useParams();
  const { userData } = useUserData();

  const currentContact = isSMS
    ? null
    : userData.contacts.find((contact) => contact.id === id);
  const displayName = isSMS
    ? (id as string)
    : currentContact?.name || "Unknown Contact";
  const displayNumber = isSMS ? (id as string) : currentContact?.number || "";

  return (
    <div className="w-full p-4 flex gap-4 shadow-sm bg-white border-b border-gray-100">
      <div className="flex-1 flex items-center gap-4">
        <Link
          href={"/phone"}
          className="cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors duration-200"
        >
          <ChevronLeftIcon className="w-6 h-6 text-indigo-500" />
        </Link>
        <div className="rounded-full w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-sm flex items-center justify-center">
          <span className="text-white text-lg font-semibold">
            {displayName[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-1 gap-2 items-center">
            <p className="truncate text-sm font-semibold sm:text-base text-gray-900">
              {displayName}
            </p>
            {isSMS && (
              <span className="px-2 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full">
                SMS
              </span>
            )}
          </div>
          <p className="truncate flex-1 text-sm text-gray-500">
            {displayNumber}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Title;

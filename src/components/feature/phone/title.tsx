import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserData } from "@/hooks/use-userdata";
import { PhoneIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";

interface TitleProps {}

const Title = () => {
  const { id } = useParams();
  const { userData } = useUserData();

  const param = decodeURIComponent(id as string);

  const currentContact = userData.contacts.find(
    (contact) => contact.id === param
  );
  const displayName = currentContact?.name || param || "";
  const displayNumber = currentContact?.number || "";
  const isSMS = !/^[a-f\d]{24}$/i.test(param);

  return (
    <div className="w-full p-4 flex gap-4 shadow-sm bg-white border-b border-gray-100">
      <div className="flex-1 flex items-center gap-4">
        <Link
          href={"/phone"}
          className="cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors duration-200"
        >
          <ChevronLeftIcon className="w-6 h-6 text-indigo-500" />
        </Link>
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
              className={`truncate text-lg font-medium text-gray-900 ${
                isSMS ? "font-mono" : ""
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
    </div>
  );
};

export default Title;

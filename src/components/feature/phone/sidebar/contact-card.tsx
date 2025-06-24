import { PhoneIcon, TrashIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  checkExtensionNumberIsRegistered,
  removeContact,
} from "@/lib/contact-action";
import { useUserData } from "@/hooks/use-userdata";
import ConfirmDialog from "@/components/ui/dialogs/confirm-dialog";

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
  const { id, name, number, unreadCount = 0 } = contact;
  const [isOnline, setIsOnline] = useState(false);
  const [type, setType] = useState<"chat" | "sms">("chat");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { refreshUserData } = useUserData();

  useEffect(() => {
    if (id.length === 0) {
      setType("sms");
    }

    if (id.length !== 0) {
      setType("chat");
    }
  }, [number]);

  useEffect(() => {
    if (type === "chat") {
      const interval = setInterval(async () => {
        const isRegistered = await checkExtensionNumberIsRegistered(number);
        setIsOnline(isRegistered || false);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [type, number]);

  const handleDelete = async () => {
    await removeContact(contact);
    await refreshUserData();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        className={`w-full p-3 flex rounded-lg gap-3 border-l-4 border-transparent hover:bg-gray-100 transition-all duration-200 ease-in-out group ${
          isSelected ? "border-indigo-500! bg-blue-50" : ""
        }`}
      >
        <Link
          href={`/phone/${type === "chat" ? id : number}`}
          className="flex gap-3 flex-1"
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
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded-full">
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
                } ${type === "sms" ? "text-xl font-mono" : "text-lg"}`}
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
              <p className="truncate flex-1 text-sm text-gray-500">
                {type === "chat" && number}
              </p>
            </div>
          </div>
        </Link>
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
          title="Delete Contact"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${
          name || number
        } from your contacts?`}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
};

export default ContactCard;

import ContactCard from "./contact-card";
import { PlusIcon } from "@heroicons/react/24/solid";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useEffect, useState } from "react";
import AddContactDialog from "./add-contact-dialog";
import { useUserData } from "@/hooks/use-userdata";
import { useParams } from "next/navigation";
import { fetchMessageCountByContact, fetchMessage } from "@/lib/message-action";

interface Contact {
  id: string;
  name: string;
  number: string;
  unreadCount?: number;
  type: "chat" | "sms";
  latestMessageTimestamp?: Date;
}

const ContactList = () => {
  const { userData } = useUserData();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchAllContacts = async () => {
      const chatContacts = await Promise.all(
        (userData?.contacts || []).map(async (contact: any) => {
          const unreadCount = await fetchMessageCountByContact(
            contact.id.length !== 0 ? contact.id : contact.number,
            "unread"
          );

          const messages = await fetchMessage(
            contact.id.length !== 0 ? contact.id : contact.number
          );
          const latestMessage =
            messages.length > 0 ? messages[messages.length - 1] : null;

          return {
            ...contact,
            unreadCount,
            type: "chat" as const,
            latestMessageTimestamp: latestMessage
              ? new Date(latestMessage.timestamp)
              : new Date(0),
          };
        })
      );

      const sortedContacts = chatContacts.sort((a, b) => {
        return (
          (b.latestMessageTimestamp?.getTime() || 0) -
          (a.latestMessageTimestamp?.getTime() || 0)
        );
      });

      setContacts(sortedContacts);
    };

    fetchAllContacts();
  }, [userData]);

  const filteredContacts = contacts?.filter(
    (contact) =>
      contact?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      contact?.number?.includes(searchQuery)
  );

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search contacts..."
            className="flex-1"
          />
          <button
            className="p-2 rounded-full hover:bg-gradient-to-r bg-indigo-400 text-white hover:bg-indigo-500 transition-all shadow-sm border border-gray-200 hover:border-transparent hover:shadow-md"
            title="Add Contact"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0">
        {filteredContacts?.map((contact) => (
          <ContactCard
            key={contact.id + contact.number + contact.name}
            contact={contact}
            isSelected={contact.id === id || contact.number === id}
          />
        ))}
      </div>

      <AddContactDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
        }}
      />
    </>
  );
};

export default ContactList;

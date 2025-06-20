import ContactCard from "./contact-card";
import { PlusIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import SearchInput from "@/components/ui/inputs/search-input";
import { useEffect, useState } from "react";
import AddContactDialog from "./add-contact-dialog";
import { useUserData } from "@/hooks/use-userdata";
import { useParams } from "next/navigation";
import { fetchMessageCountByContact } from "@/lib/message-action";

interface Contact {
  id: string;
  name: string;
  number: string;
  unreadCount?: number;
  type: "chat" | "sms";
}

const ContactList = () => {
  const { userData } = useUserData();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchAllContacts = async () => {
      // Fetch regular contacts with unread counts
      const chatContacts = await Promise.all(
        (userData?.contacts || []).map(async (contact: any) => {
          const unreadCount = await fetchMessageCountByContact(
            contact.id,
            "unread"
          );
          return {
            ...contact,
            unreadCount,
            type: "chat" as const,
          };
        })
      );

      // Fetch SMS contacts
      try {
        const response = await fetch("/api/sms/contacts");
        const result = await response.json();
        const smsContacts = result.success
          ? result.data.map((contact: any) => ({
              id: contact.number,
              name: contact.number,
              number: contact.number,
              unreadCount: contact.unreadCount,
              type: "sms" as const,
            }))
          : [];

        // Combine and sort all contacts by unread count and name
        const allContacts = [...chatContacts, ...smsContacts].sort((a, b) => {
          if (b.unreadCount !== a.unreadCount) {
            return (b.unreadCount || 0) - (a.unreadCount || 0);
          }
          return a.name.localeCompare(b.name);
        });

        setContacts(allContacts);
      } catch (error) {
        console.error("Error fetching SMS contacts:", error);
        setContacts(chatContacts);
      }
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
            key={contact.id}
            contact={contact}
            isSelected={contact.id === id}
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

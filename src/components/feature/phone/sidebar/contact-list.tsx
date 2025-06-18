import ContactCard from "./contact-card";
import { PlusIcon } from "@heroicons/react/24/solid";
import SearchInput from "@/components/ui/inputs/search-input";
import { useEffect, useState } from "react";
import AddContactDialog from "./add-contact-dialog";
import { useUserData } from "@/hooks/use-userdata";
import { useParams } from "next/navigation";
import { fetchMessageCountByContact } from "@/lib/message-action";

const ContactList = () => {
  const { userData } = useUserData();
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchContacts = async () => {
      const temp = await Promise.all(
        userData?.contacts?.map(async (contact: any) => {
          const unreadCount = await fetchMessageCountByContact(
            contact.id,
            "unread"
          );
          return {
            ...contact,
            unreadCount,
          };
        })
      );
      setContacts(temp);
    };
    fetchContacts();
  }, [userData]);

  const filteredContacts = contacts?.filter(
    (contact) =>
      contact?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      contact?.number?.includes(searchQuery)
  );

  return (
    <>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
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

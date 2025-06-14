import ContactCard from "./contact-card";
import { PlusIcon } from "@heroicons/react/24/solid";
import SearchInput from "@/components/ui/inputs/search-input";
import { useEffect, useState } from "react";
import AddContactDialog from "./add-contact-dialog";
import { useUserData } from "@/hooks/use-userdata";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { useParams } from "next/navigation";

const ContactList = () => {
  const { userData, refreshUserData } = useUserData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { messages: sipMessages } = useSIPProvider();
  const { id } = useParams();

  const filteredContacts = userData?.contacts?.filter(
    (contact) =>
      contact?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      contact?.number?.includes(searchQuery)
  );

  return (
    <>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Contacts</h2>
          <button
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            title="Add Contact"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts..."
          className="mb-2"
        />
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

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialogs/dialog";
import SearchInput from "@/components/ui/inputs/search-input";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Contact } from "@/types/user";
import { addContact, getCandidates } from "@/lib/contact-action";
import { useUserData } from "@/hooks/use-userdata";
import { useRouter } from "next/navigation";

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContactDialog = ({ isOpen, onClose }: AddContactDialogProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { refreshUserData } = useUserData();

  useEffect(() => {
    if (searchQuery.length > 0) {
      const gettingCandidates = async () => {
        const candidates = await getCandidates(searchQuery);
        setCandidates(candidates);
      };
      gettingCandidates();
    } else {
      setCandidates([]);
    }
  }, [searchQuery]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleAddContact = async () => {
    let number = "";
    if (!selectedContact) {
      number = searchQuery;
    } else {
      number = selectedContact.number;
    }
    const contact = {
      id: selectedContact?.id || "",
      name: selectedContact?.name || "",
      number,
    };

    if (contact) {
      await addContact(contact);
      if (contact?.id && contact?.id !== "") {
        router.push(`/phone/${contact.id}`);
      } else {
        router.push(`/phone/${number}`);
      }
    }

    await refreshUserData();
    handleCancel();
  };

  const handleCancel = () => {
    setSearchQuery("");
    setSelectedContact(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Contact" maxWidth="md">
      <div className="space-y-4">
        <div>
          <SearchInput
            value={searchQuery}
            onChange={(s) => (s.length <= 10 ? setSearchQuery(s) : null)}
            placeholder="Search by name or number..."
            className="w-full h-12"
          />
        </div>

        {candidates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Candidates</h3>
            <div className="space-y-1">
              {candidates.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedContact?.id === contact.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.number}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddContact}
            disabled={searchQuery.length === 0}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 ${
              searchQuery.length > 0
                ? "bg-indigo-500 hover:bg-indigo-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddContactDialog;

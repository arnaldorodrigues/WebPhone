import { Dialog } from "@/components/ui/dialogs";
import { SearchInput } from "@/components/ui/inputs";
import { ICandidateItem } from "@/core/contacts/model";
import { createContact } from "@/core/contacts/request";
import { AppDispatch, RootState } from "@/store";
import { ContactType } from "@/types/common";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type Props = {
  isOpen: boolean;
  onClose: () => void
}

const AddContactDialog: React.FC<Props> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>()

  const { candidates } = useSelector((state: RootState) => state.contactsdata);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState<ICandidateItem[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ICandidateItem>();

  const handleSelectCandidate = (candidate: ICandidateItem) => {
    setSelectedCandidate(candidate);
  }

  const handleAddContact = () => {
    if (selectedCandidate) {
      dispatch(createContact({
        contactUserId: selectedCandidate?.id,
        contactType: ContactType.WEBRTC,
        sipNumber: selectedCandidate?.sipUsername
      }));

    } else {
      dispatch(createContact({
        contactUserId: "",
        contactType: ContactType.SMS,
        phoneNumber: searchQuery
      }));
    }

    onClose();
  }

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1)
      return;

    if (!candidates || candidates.length < 1) {
      setFilteredCandidates([]);
    }

    const filter = candidates.filter(c => c.sipUsername.includes(searchQuery));
    setFilteredCandidates(filter);
  }, [searchQuery])

  useEffect(() => {
    setSearchQuery("");
    setFilteredCandidates([])
  }, [isOpen])

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

        {filteredCandidates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Candidates</h3>
            <div className="space-y-1">
              {filteredCandidates.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectCandidate(contact)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${selectedCandidate?.id === contact.id
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
                        {contact.sipUsername}
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
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddContact}
            disabled={searchQuery.length === 0}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 ${searchQuery.length > 0
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
  )
}

export default AddContactDialog;
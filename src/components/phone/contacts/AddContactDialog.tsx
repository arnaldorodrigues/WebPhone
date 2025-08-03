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
  const { userData, loading: userDataLoading } = useSelector((state: RootState) => state.userdata);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState<ICandidateItem[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ICandidateItem>();
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectCandidate = (candidate: ICandidateItem) => {
    setSelectedCandidate(candidate);
  }

  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddContact = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    setIsSuccess(false);
    
    try {
      if (selectedCandidate) {
        await dispatch(createContact({
          contactUserId: selectedCandidate?.id,
          contactType: ContactType.WEBRTC,
          sipNumber: selectedCandidate?.sipUsername
        }));
      } else {
        await dispatch(createContact({
          contactUserId: "",
          contactType: ContactType.SMS,
          phoneNumber: searchQuery
        }));
      }
      // Show success message
      setIsSuccess(true);
      // The dialog will be closed by the useEffect hook after a delay
    } catch (error) {
      console.error("Error creating contact:", error);
      // Close the dialog on error
      onClose();
    } finally {
      setIsCreating(false);
    }
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
    setFilteredCandidates([]);
    
    // Reset isCreating when dialog is closed
    if (!isOpen) {
      setIsCreating(false);
    }
  }, [isOpen])
  
  // Handle delayed closing of the dialog when contact is created successfully
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose])

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

        <div className="flex flex-col space-y-2">
          {isCreating && (
            <div className="text-sm text-gray-500 mb-2">
              Adding contact...
            </div>
          )}
          
          {isSuccess && (
            <div className="text-sm text-green-500 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contact added successfully!
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleAddContact}
              disabled={searchQuery.length === 0 || isCreating}
              data-testid="add-contact-button"
              className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 ${
                searchQuery.length > 0 && !isCreating
                  ? "bg-indigo-500 hover:bg-indigo-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isCreating ? (
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <CheckIcon className="w-4 h-4 mr-2" />
              )}
              {isCreating ? "Adding..." : "Add Contact"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default AddContactDialog;
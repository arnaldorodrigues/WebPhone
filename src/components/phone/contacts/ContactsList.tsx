'use client'

import { PlusIcon } from "@heroicons/react/24/outline"
import { SearchInput } from "../../ui/inputs"
import { useEffect, useState } from "react"
import { IContactItem } from "@/core/contacts/model";
import ContactCard from "./ContactCard";
import AddContactDialog from "./AddContactDialog";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { createContact, getCandidates, getContacts } from "@/core/contacts/request";
import { setSelectedContact } from "@/store/slices/contactsSlice";
import { getMessages } from "@/core/messages/request";
import { useSip } from "@/contexts/SipContext";
import { ContactType } from "@/types/common";
import { useSmsSocket } from "@/contexts/SmsContext";

export const ContactsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { sipMessages } = useSip();
  const { smsMessages } = useSmsSocket();

  const { contacts, selectedContact } = useSelector((state: RootState) => state.contactsdata);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const handleSelectContact = (item: IContactItem) => {
    dispatch(setSelectedContact(item));
  }

  useEffect(() => {
    if (isAddDialogOpen) return;
    dispatch(getContacts());
  }, [isAddDialogOpen])

  useEffect(() => {
    dispatch(getContacts());
    dispatch(getCandidates());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedContact) return;

    dispatch(getMessages(selectedContact.id));
  }, [selectedContact, sipMessages, smsMessages])

  useEffect(() => {
    if (!sipMessages || Object.keys(sipMessages).length < 1)
      return;

    const keys = Object.keys(sipMessages);
    const lastKey = keys[keys.length - 1];

    const contact = contacts.find(c => c.number === sipMessages[lastKey].from);

    if (!contact) {
      dispatch(createContact({
        contactType: ContactType.WEBRTC,
        sipNumber: sipMessages[lastKey].from
      }));
    } else {
      dispatch(getContacts());
    }
  }, [sipMessages])


  useEffect(() => {
    if (!smsMessages || Object.keys(smsMessages).length < 1)
      return;

    const keys = Object.keys(smsMessages);
    const lastKey = keys[keys.length - 1];

    const contact = contacts.find(c => c.number === smsMessages[lastKey].from);

    if (!contact) {
      dispatch(createContact({
        contactType: ContactType.SMS,
        phoneNumber: smsMessages[lastKey].from
      }));
    } else {
      dispatch(getContacts());
    }
  }, [smsMessages])

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
        {contacts?.map((contact: IContactItem, index: number) => (
          <div key={index}>
            <ContactCard
              contact={contact}
              isSelected={contact.id === selectedContact?.id}
              onSelect={(item: IContactItem) => handleSelectContact(item)}
            />
          </div>
        ))}
      </div>

      <AddContactDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </>
  )
}
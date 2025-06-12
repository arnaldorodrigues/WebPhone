import ContactCard from "./contact-card";
import { PlusIcon } from "@heroicons/react/24/solid";
import SearchInput from "@/components/ui/inputs/search-input";
import { useState } from "react";

const ContactList = () => {
  const contacts: any[] = [];
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Contacts</h2>
          <button
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            title="Add Contact"
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
      <div className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0 ">
        {contacts.map((_, index) => (
          <ContactCard key={index} />
        ))}
      </div>
    </>
  );
};

export default ContactList;

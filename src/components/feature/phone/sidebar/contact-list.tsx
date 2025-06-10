import ContactCard from "./contact-card";

const ContactList = () => {
  const contacts: any[] = [];

  return (
    <>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-900">Contacts</h2>
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

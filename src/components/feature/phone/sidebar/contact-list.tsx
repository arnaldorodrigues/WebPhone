import ContactCard from "./contact-card";

const ContactList = () => {
  const contacts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="flex flex-col w-full h-full p-2 gap-1 overflow-y-auto">
      {contacts.map((_, index) => (
        <ContactCard key={index} />
      ))}
    </div>
  );
};

export default ContactList;

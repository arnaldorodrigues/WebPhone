import ContactList from "./contact-list";
import Me from "./me";

const Sidebar = () => {
  return (
    <div className="w-full h-full flex flex-col sm:w-md bg-white">
      <Me />
      <ContactList />
    </div>
  );
};

export default Sidebar;

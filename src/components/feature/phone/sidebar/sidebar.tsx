import ContactList from "./contact-list";
import { Me } from "./me";

const Sidebar = ({ hidden = false }: { hidden?: boolean }) => {
  return (
    <div
      className={`w-full h-full flex flex-col sm:block sm:w-md bg-white ${
        hidden && "hidden"
      }`}
    >
      <Me />
      <ContactList />
    </div>
  );
};

export default Sidebar;

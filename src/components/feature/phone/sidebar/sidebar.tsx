import { useState } from "react";
import ContactList from "./contact-list";
import { Me } from "./me";
import { usePathname } from "next/navigation";

const Sidebar = ({ hidden = false }: { hidden?: boolean }) => {
  const pathname = usePathname();

  return (
    <div
      className={`w-full h-[calc(100vh-4rem)] pb-5 sm:block sm:w-80 bg-white border-r border-gray-100 shadow-sm ${
        hidden && "hidden"
      }`}
    >
      <div className="h-full flex flex-col">
        <Me />
        <ContactList />
      </div>
    </div>
  );
};

export default Sidebar;

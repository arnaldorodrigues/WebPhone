import { CalendarIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const AdminHeader = () => {
  const pathname = usePathname();

  const [title, setTitle] = useState<string>();

  useEffect(() => {
    const title = pathname.split("/").pop()?.toUpperCase();
    setTitle(title);
  }, [pathname])
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
              {new Date().toLocaleDateString("en-US")}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
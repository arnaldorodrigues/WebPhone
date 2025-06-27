"use client";

import AdminSidebar from "@/components/feature/admin/sidebar/admin-sidebar";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const title = usePathname();
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="w-full h-full flex-1 flex flex-row ">
        <AdminSidebar />
        <div className="flex-1 min-w-0 w-full">
          <div className="min-h-full w-full bg-gray-50">
            <div className="w-full">
              <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {title.split("/").pop()?.toUpperCase() === "ADMIN"
                        ? "Dashboard"
                        : title.split("/").pop()?.toUpperCase()}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default RootLayout;

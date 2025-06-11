"use client";

import Sidebar from "@/components/feature/phone/sidebar/sidebar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

interface Props {}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const sidebarVisible = pathname.endsWith("phone");

  return (
    <ProtectedRoute requiredRole="user">
      <div className="w-full h-full flex-1 flex flex-row ">
        <Sidebar hidden={!sidebarVisible} />
        <div className={`flex-1 ${sidebarVisible && "hidden"}}`}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default RootLayout;

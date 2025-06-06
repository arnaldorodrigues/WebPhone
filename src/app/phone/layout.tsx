"use client";

import Sidebar from "@/components/feature/phone/sidebar/sidebar";
import { usePathname } from "next/navigation";

interface Props {}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const sidebarVisible = pathname.endsWith("phone");

  return (
    <div className="w-full h-screen flex flex-row">
      <Sidebar hidden={!sidebarVisible} />
      <div className={`flex-1 ${sidebarVisible && "hidden"}}`}>{children}</div>
    </div>
  );
};

export default RootLayout;

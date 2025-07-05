'use client'

import { AdminHeader, AdminSideBar } from "@/components/admin";
import { SplashLoader } from "@/components/ui/splash";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        router.push('/signin');
      }
    }
  }, [loading, user]);

  return (
    <>
      {loading ? (
        <SplashLoader />
      ) : (
        <div className="flex">
          <AdminSideBar />
          <div className="flex-1 min-w-0 w-full">
            <AdminHeader />
            {children}
          </div>
        </div>
      )}
    </>
  )
}

export default AdminLayout;
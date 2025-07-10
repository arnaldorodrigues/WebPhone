'use client'

import { AdminHeader, AdminSideBar } from "@/components/admin";
import { SplashLoader } from "@/components/ui/splash";
import { LayoutBackground } from "@/components/ui/svg";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthLayout = ({
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
          <div className="absolute inset-0">
            <LayoutBackground />
          </div>
          {children}
        </div>
      )}
    </>
  )
}

export default AuthLayout;
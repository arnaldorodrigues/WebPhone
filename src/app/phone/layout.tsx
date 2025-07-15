'use client'

import { SplashLoader } from "@/components/ui/splash";
import { useAuth } from "@/contexts/AuthContext"
import { SipProvider } from "@/contexts/SipContext";
import { store } from "@/store";
import { UserRole } from "@/types/common";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Provider } from "react-redux";

const PhoneLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== UserRole.USER) {
        router.push('/signin');
      }
    }
  }, [loading, user]);

  return (
    <>
      {loading ? (
        <SplashLoader />
      ) : (
        <Provider store={store}>
          <SipProvider>
            <div className="flex">
              <div className="flex-1 min-w-0 w-full">
                {children}
              </div>
            </div>
          </SipProvider>
        </Provider>
      )}
    </>
  )
}

export default PhoneLayout;
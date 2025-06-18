"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getParsedToken } from "@/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useLayoutEffect(() => {
    if (isLoading) return; // Wait for auth state to be determined

    if (!isAuthenticated) {
      if (pathname === "/") {
        router.push("/");
      } else if (pathname !== "/signin" && pathname !== "/signup") {
        router.push("/signin");
      }

      return;
    }

    // User is authenticated, get their role from token
    const tokenData = getParsedToken();
    const userRole = tokenData?.role;

    // If redirectOnAuth is true (used for signin/signup pages), redirect authenticated users
    if (userRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/phone");
    }

    if (pathname === "/" || pathname === "/signin" || pathname === "/signup") {
      if (userRole === "user") {
        router.push("/phone");
      } else {
        router.push("/admin");
      }
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

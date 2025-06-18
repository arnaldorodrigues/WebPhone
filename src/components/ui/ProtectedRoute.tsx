"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getParsedToken } from "@/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
  redirectOnAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectOnAuth = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const tokenData = getParsedToken();
    const userRole = tokenData?.role;

    if (redirectOnAuth) {
      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/phone");
      }
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/phone");
      }
      return;
    }
  }, [isLoading, isAuthenticated, router, requiredRole, redirectOnAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (redirectOnAuth) {
    return null;
  }

  return <>{children}</>;
}

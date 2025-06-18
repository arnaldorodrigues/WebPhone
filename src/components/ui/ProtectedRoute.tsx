"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getParsedToken } from "@/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
  redirectOnAuth?: boolean; // If true, redirect authenticated users to their respective dashboards
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectOnAuth = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to be determined

    if (!isAuthenticated) {
      // User is not authenticated, redirect to signin
      router.push("/signin");
      return;
    }

    // User is authenticated, get their role from token
    const tokenData = getParsedToken();
    const userRole = tokenData?.role;

    // If redirectOnAuth is true (used for signin/signup pages), redirect authenticated users
    if (redirectOnAuth) {
      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/phone");
      }
      return;
    }

    // Check if user has required role for protected routes
    if (requiredRole && userRole !== requiredRole) {
      // User doesn't have required role, redirect to their appropriate dashboard
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

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // If redirectOnAuth is true, don't render children (we're redirecting)
  // if (redirectOnAuth) {
  //   return null;
  // }

  return <>{children}</>;
}

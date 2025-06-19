"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getParsedToken } from "@/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
  redirectOnAuth?: boolean;
}

const publicRoutes = ["/signin", "/signup", "/"];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const token = getParsedToken();

  useLayoutEffect(() => {
    if (token) {
      if (publicRoutes.includes(pathname)) {
        if (token?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/phone");
        }
      } else {
        if (token?.role === "admin" && pathname.includes("/phone")) {
          router.push("/admin");
        } else if (token?.role === "user" && pathname.includes("/admin")) {
          router.push("/phone");
        }
        return;
      }
    } else {
      if (publicRoutes.includes(pathname)) {
        return;
      } else {
        router.push("/signin");
      }
    }
  }, [router, pathname, token]);

  return <>{children}</>;
}

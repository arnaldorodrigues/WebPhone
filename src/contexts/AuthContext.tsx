'use client'

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type DecodedToken = {
  userId: string;
  userName: string;
  email?: string;
  role?: string;
  exp: number;
  iat: number;
}

type AuthContextType = {
  user: DecodedToken | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  const getToken = () => typeof window !== "undefined" && localStorage.getItem('token');

  const loadUserFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return null;
      }
      return decoded;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  }

  useEffect(() => {
    const decoded = loadUserFromToken();
    setUser(decoded);
    setLoading(false);
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Login Failed');

    const { token } = await res.json();

    localStorage.setItem('token', token);
    const decoded = jwtDecode<DecodedToken>(token);
    setUser(decoded);

    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken } from '@/utils/auth';

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setToken(data.token);
      setIsAuthenticated(true);
      router.push('/phone');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res) {
        throw new Error('The user exist already.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/signin');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    router.push('/signin');
  };

  return {
    isLoading,
    isAuthenticated,
    signin,
    signup,
    logout,
  };
}; 
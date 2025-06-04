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

      console.log('data', data);

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setToken(data.token);
      setIsAuthenticated(true);
      router.push('/dashboard');
      console.log(isAuthenticated)
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setToken(data.token);
      setIsAuthenticated(true);
      console.log(data.token, isAuthenticated);
      router.push('/dashboard');
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
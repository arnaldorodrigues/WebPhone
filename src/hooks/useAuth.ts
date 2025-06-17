'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken } from '@/utils/auth';
import { useUserData } from './use-userdata';
import { useSIPProvider } from './sip-provider/sip-provider-context';

const SETTINGS_STORAGE_KEY = 'user_settings';

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {refreshUserData, clearUserData} = useUserData();
  const {disconnect} = useSIPProvider();
  
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const signin = async ({email, password}: {email: string, password: string}) => {
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
      
      // Role-based routing
      if (data.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/phone');
      }

      refreshUserData();
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async ( {password, name, email}: {password: string, name: string, email: string}) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, name, email }),
      });

      if (!res) {
        throw new Error('The user exist already.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      refreshUserData();

      router.push('/signin');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear authentication state
      removeToken();
      setIsAuthenticated(false);
      
      // Clear stored settings from localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(SETTINGS_STORAGE_KEY);
        } catch (error) {
          console.error('Error clearing settings from localStorage:', error);
        }
      }

      // Clear user data in context
      clearUserData();
      
      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still redirect to signin
      router.push('/signin');
    }
    finally {
      setIsLoading(false);
      setIsAuthenticated(false);
      await disconnect();
    }
  };

  return {
    isLoading,
    isAuthenticated,
    signin,
    signup,
    logout,
  };
}; 
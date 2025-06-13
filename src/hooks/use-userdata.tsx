"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { userAction, UserData } from "@/lib/user-action";
import { SipConfig } from "@/types/sip-type";

// Create context
interface UserDataContextType {
  userData: UserData;
  sipConfig: SipConfig | null;
  isLoading: boolean;
  error: Error | null;
  setUserData: (
    newData: UserData | (UserData & { password?: string; newPassword?: string })
  ) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearUserData: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

// Provider component
export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserDataState] = useState<UserData>(
    userAction.defaultUserData
  );
  const [sipConfig, setSipConfig] = useState<SipConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to get user data from API
  const getUserData = useCallback(async () => {
    try {
      const loadedData = await userAction.get();
      return loadedData;
    } catch (err) {
      console.error("Error getting user data:", err);
      return userAction.defaultUserData;
    }
  }, []);

  // Load user data function
  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const loadedData = await getUserData();

      setUserDataState(loadedData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load user data")
      );
    } finally {
      setIsLoading(false);
    }
  }, [getUserData]);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Function to get SIP configuration
  useEffect(() => {
    if (!userData.settings) {
      return;
    }

    setSipConfig({
      wsServer: userData.settings.wsServer,
      wsPort: userData.settings.wsPort,
      wsPath: userData.settings.wsPath,
      server: userData.settings.domain,
      username: userData.settings.sipUsername,
      password: userData.settings.sipPassword,
      displayName: userData.name,
    });
  }, [userData]);

  const setUserData = async (
    newData: UserData | (UserData & { password?: string; newPassword?: string })
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update database
      await userAction.set(newData);

      // Update local state
      setUserDataState(newData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to update user data")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function to manually reload user data from database
  const refreshUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Force fetch from database
      const loadedData = await userAction.get();
      setUserDataState(loadedData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to refresh user data")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to clear user data (useful for logout or reset)
  const clearUserData = useCallback(() => {
    setUserDataState(userAction.defaultUserData);
    setSipConfig(null);
  }, []);

  const value = {
    userData,
    sipConfig,
    isLoading,
    error,
    setUserData,
    refreshUserData,
    clearUserData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

// Custom hook to use the user data context
export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}

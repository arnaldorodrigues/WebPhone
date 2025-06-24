"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { userAction } from "@/lib/user-action";
import { UserData } from "@/types/user";
import { SipConfig } from "@/types/sip-type";

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

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserDataState] = useState<UserData>(
    userAction.defaultUserData
  );
  const [sipConfig, setSipConfig] = useState<SipConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getUserData = useCallback(async () => {
    try {
      const loadedData = await userAction.get();

      return loadedData;
    } catch (err) {
      console.error("Error getting user data:", err);
      return userAction.defaultUserData;
    }
  }, []);

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

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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

      await userAction.set(newData);

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

  const refreshUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}

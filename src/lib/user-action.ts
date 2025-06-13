import { fetchWithAuth } from "@/utils/api";

export interface UserSettings {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  domain: string;
  sipUsername: string;
  sipPassword: string;
  updatedAt?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  settings: UserSettings | null;
}

// Default user data
export const defaultUserData: UserData = {
  id: "",
  name: "",
  email: "",
  role: "user",
  status: "inactive",
  createdAt: new Date().toISOString(),
  settings: {
    wsServer: "",
    wsPort: "",
    wsPath: "/",
    domain: "",
    sipUsername: "",
    sipPassword: "",
  },
};

// User-specific operations
export const userAction = {
  defaultUserData,
  get: async (): Promise<UserData> => {
    try {
      const response = await fetchWithAuth('/api/users');
      if (!response.ok) {
        if (response.status === 404) {
          return defaultUserData;
        }
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();

      return data.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return defaultUserData;
    }
  },

  set: async (userData: UserData & { password?: string; newPassword?: string }): Promise<void> => {
    try {
      const response = await fetchWithAuth('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          password: userData.password,
          newPassword: userData.newPassword,
          settings: userData.settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user data');
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  reset: async (): Promise<void> => {
    await userAction.set(defaultUserData);
  }
}; 
import { fetchWithAuth } from "@/utils/api";

// Define the settings interface
export interface Settings {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  fullName: string;
  domain: string;
  sipUsername: string;
  sipPassword: string;
  vmNumber: string;
  sxServer: string;
  xwPort: string;
  xwPath: string;
  xDomain: string;
  extensionNumber: string;
  isSTV: boolean;
  chatEngine: string;
}

// Default settings
export const defaultSettings: Settings = {
  wsServer: "",
  wsPort: "",
  wsPath: "",
  fullName: "",
  domain: "",
  sipUsername: "",
  sipPassword: "",
  vmNumber: "",
  sxServer: "",
  xwPort: "",
  xwPath: "",
  xDomain: "",
  extensionNumber: "",
  isSTV: false,
  chatEngine: "SIP"
};

// Settings-specific operations
export const settingsAction = {
  defaultSettings,
  get: async (): Promise<Settings> => {
    try {
      const response = await fetchWithAuth('/api/settings');
      if (!response.ok) {
        if (response.status === 404) {
          return defaultSettings;
        }
        throw new Error('Failed to fetch settings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      return defaultSettings;
    }
  },

  set: async (settings: Settings): Promise<void> => {
    try {
      const response = await fetchWithAuth('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  reset: async (): Promise<void> => {
    await settingsAction.set(defaultSettings);
  }
}; 
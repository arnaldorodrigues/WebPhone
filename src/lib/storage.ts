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

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'settings'
} as const;

// Generic storage operations
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }
};

// Settings-specific operations
export const settingsStorage = {
  get: (): Settings => {
    return storage.get<Settings>(STORAGE_KEYS.SETTINGS) || defaultSettings;
  },

  set: (settings: Settings): void => {
    storage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  reset: (): void => {
    storage.set(STORAGE_KEYS.SETTINGS, defaultSettings);
  }
}; 
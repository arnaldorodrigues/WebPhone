"use client";

import { useState, useEffect, useCallback } from "react";
import { settingsAction } from "@/lib/action";
import { SipConfig } from "@/types/sip-type";

const SETTINGS_STORAGE_KEY = 'user_settings';

export function useSettings() {
  const [settings, setSettings] = useState(settingsAction.defaultSettings);
  const [sipConfig, setSipConfig] = useState<SipConfig | undefined>(undefined);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to get settings from localStorage
  const getSettingsFromStorage = useCallback(() => {
    try {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading settings from localStorage:', error);
      return null;
    }
  }, []);

  // Helper function to save settings to localStorage
  const saveSettingsToStorage = useCallback((settings: typeof settingsAction.defaultSettings) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, []);

  // Load settings function - checks localStorage first, then database
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, try to get settings from localStorage
      const localSettings = getSettingsFromStorage();
      
      if (localSettings) {
        // If found in localStorage, use those settings
        setSettings(localSettings);
        setError(null);
      } else {
        // If not found in localStorage, fetch from database
        const loadedSettings = await settingsAction.get();
        setSettings(loadedSettings);
        
        // Save to localStorage for future use
        if (loadedSettings && JSON.stringify(loadedSettings) !== JSON.stringify(settingsAction.defaultSettings)) {
          saveSettingsToStorage(loadedSettings);
        }
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
      // If database fails, still try to use localStorage as fallback
      const localSettings = getSettingsFromStorage();
      if (localSettings) {
        setSettings(localSettings);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getSettingsFromStorage, saveSettingsToStorage]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update SIP config when settings change
  useEffect(() => {
    const config: SipConfig = {
      wsServer: settings.wsServer,
      wsPort: settings.wsPort,
      wsPath: settings.wsPath,
      server: settings.domain,
      username: settings.sipUsername,
      password: settings.sipPassword,
      displayName: settings.name,
    };
    setSipConfig(config);
    setIsConfigLoaded(true);
  }, [settings]);

  const updateSettings = async (newSettings: typeof settings) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Step 1: Update database first
      await settingsAction.set(newSettings);
      
      // Step 2: If database update succeeds, update localStorage
      saveSettingsToStorage(newSettings);
      
      // Step 3: Update local state
      setSettings(newSettings);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function to manually reload settings from database and sync localStorage
  const refreshSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Force fetch from database
      const loadedSettings = await settingsAction.get();
      setSettings(loadedSettings);
      
      // Update localStorage with fresh data from database
      if (loadedSettings && JSON.stringify(loadedSettings) !== JSON.stringify(settingsAction.defaultSettings)) {
        saveSettingsToStorage(loadedSettings);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh settings'));
    } finally {
      setIsLoading(false);
    }
  }, [saveSettingsToStorage]);

  // Function to clear localStorage (useful for logout or reset)
  const clearStoredSettings = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing settings from localStorage:', error);
    }
  }, []);

  return {
    settings,
    sipConfig,
    isConfigLoaded,
    isLoading,
    error,
    updateSettings,
    refreshSettings,
    clearStoredSettings, // New function to clear localStorage
  };
} 
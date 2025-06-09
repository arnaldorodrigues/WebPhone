"use client";

import { useState, useEffect, useCallback } from "react";
import { settingsAction } from "@/lib/action";
import { SipConfig } from "@/lib/sip-client";

export function useSettings() {
  const [settings, setSettings] = useState(settingsAction.defaultSettings);
  const [sipConfig, setSipConfig] = useState<SipConfig | undefined>(undefined);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load settings function
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedSettings = await settingsAction.get();
      setSettings(loadedSettings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      displayName: settings.fullName,
    };
    setSipConfig(config);
    setIsConfigLoaded(true);
  }, [settings]);

  const updateSettings = async (newSettings: typeof settings) => {
    try {
      setIsLoading(true);
      await settingsAction.set(newSettings);
      setSettings(newSettings);
      setError(null);
      
      // Trigger a fresh load after update to ensure consistency
      setTimeout(() => {
        loadSettings();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function to manually reload settings
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  return {
    settings,
    sipConfig,
    isConfigLoaded,
    isLoading,
    error,
    updateSettings,
    refreshSettings,
  };
} 
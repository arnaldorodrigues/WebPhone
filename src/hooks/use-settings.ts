"use client";

import { useState, useEffect } from "react";
import { settingsStorage } from "@/lib/storage";
import { SipConfig } from "@/lib/sip-client";

const SETTINGS_KEY = 'settings';

export function useSettings() {
  const [settings, setSettings] = useState(settingsStorage.get());
  const [sipConfig, setSipConfig] = useState<SipConfig | undefined>(undefined);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) {
        const newSettings = settingsStorage.get();
        setSettings(newSettings);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

  const updateSettings = (newSettings: typeof settings) => {
    settingsStorage.set(newSettings);
    setSettings(newSettings);
  };

  return {
    settings,
    sipConfig,
    isConfigLoaded,
    updateSettings,
  };
} 
"use client";

import * as React from "react";
import { getSettings, updateSettings } from "@/services/settingsService";
import type { AppSettings, ThemeOption } from "@/types";

interface SettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    getSettings().then((data) => {
      if (mounted) {
        setSettings(data);
        applyThemeClass(data.theme);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const applyThemeClass = (theme: ThemeOption) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!settings) return;
    
    // Optimistic update
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (key === "theme") {
      applyThemeClass(value as ThemeOption);
    }

    try {
      await updateSettings(newSettings);
    } catch (e) {
      console.error("Failed to update setting internally", e);
      // Revert if failed (optional, simple app so we might just ignore)
      setSettings(settings);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

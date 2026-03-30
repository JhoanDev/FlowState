"use client";

import * as React from "react";
import { getSettings, updateSettings } from "@/services/settingsService";
import type { AppSettings, ThemeOption, LanguageOption } from "@/types";
import i18n from "@/lib/i18n";

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
        applyLanguage(data.language);
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

  const applyLanguage = (language: LanguageOption) => {
    // Map the app's LanguageOption to i18n locale keys
    const localeMap: Record<LanguageOption, string> = {
      en: "en",
      pt: "pt-BR",
      es: "en", // es not implemented yet, fallback to en
    };
    i18n.changeLanguage(localeMap[language]);
  };

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!settings) return;
    
    // Optimistic update
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (key === "theme") {
      applyThemeClass(value as ThemeOption);
    }
    if (key === "language") {
      applyLanguage(value as LanguageOption);
    }

    try {
      await updateSettings(newSettings);
    } catch (e) {
      console.error("Failed to update setting internally", e);
      // Revert if failed
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


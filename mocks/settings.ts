import { AppSettings } from "@/types";

// This simulates the JSON configuration file stored in the local OS (Tauri FS)
export const mockSettings: AppSettings = {
  theme: "system",
  language: "en",
  timeFormat: "24h",
  dateFormat: "BR",
  strictModeDefault: false,
};

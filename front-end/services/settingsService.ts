import { AppSettings } from "@/types";
import { invokeTauri } from "@/services/tauri";
import { mockSettings } from "@/mocks/settings";

const SIMULATED_DELAY = 400;

// ─── Core Settings API ──────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const res = await invokeTauri<AppSettings>("get_settings");
  if (res) return res;

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
  return { ...mockSettings };
}

export async function updateSettings(partialData: Partial<AppSettings>): Promise<AppSettings> {
  const res = await invokeTauri<AppSettings>("update_settings", { settings: partialData });
  if (res) return res;

  await new Promise((resolve) => setTimeout(resolve, 600));
  Object.assign(mockSettings, partialData);
  return { ...mockSettings };
}

// ─── Data Vault API (Import/Export/Wipe) ─────────────────────────

export async function exportDataVault(): Promise<boolean> {
  const res = await invokeTauri<boolean>("export_data_vault");
  if (res !== null) return res;

  await new Promise((resolve) => setTimeout(resolve, 1200));
  return true;
}

export async function importDataVault(): Promise<boolean> {
  const res = await invokeTauri<boolean>("import_data_vault");
  if (res !== null) return res;

  await new Promise((resolve) => setTimeout(resolve, 1500));
  return true;
}

export async function wipeAllData(): Promise<boolean> {
  const res = await invokeTauri<boolean>("wipe_all_data");
  if (res !== null) return res;

  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
}

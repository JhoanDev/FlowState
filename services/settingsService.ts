import { AppSettings } from "@/types";
import { invokeTauri } from "@/services/tauri";
import { mockSettings } from "@/mocks/settings";
import { save, open } from '@tauri-apps/plugin-dialog';

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
  const path = await save({
    filters: [{ name: 'Database', extensions: ['db', 'sqlite'] }],
    defaultPath: `flowstate-backup-${new Date().toISOString().split('T')[0]}.db`
  });
  if (!path) return false;
  
  const res = await invokeTauri<boolean>("export_data_vault", { path });
  return res !== null ? res : false;
}

export async function importDataVault(): Promise<boolean> {
  const path = await open({
    multiple: false,
    directory: false,
    filters: [{ name: 'Database', extensions: ['db', 'sqlite'] }]
  });
  if (!path) return false;

  const res = await invokeTauri<boolean>("import_data_vault", { path });
  return res !== null ? res : false;
}

export async function wipeAllData(): Promise<boolean> {
  const res = await invokeTauri<boolean>("wipe_all_data");
  if (res !== null) return res;

  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
}

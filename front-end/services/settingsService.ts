import { AppSettings } from "@/types";
import { mockSettings } from "@/mocks/settings";

const SIMULATED_DELAY = 400;

// Tauri interface detection
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function invokeTauri<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  if (isTauri()) {
    try {
      // @ts-expect-error: @tauri-apps/api/core might not be installed in the purely mock environment
      const { invoke } = await import("@tauri-apps/api/core");
      // @ts-expect-error: TS cannot infer the return type of dynamic imports easily
      return await invoke<T>(cmd, args);
    } catch (error) {
      console.warn(`Failed to invoke Tauri command: ${cmd}`, error);
      return null;
    }
  }
  return null;
}

// ─── Core Settings API ──────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  if (isTauri()) {
    const res = await invokeTauri<AppSettings>("get_settings");
    if (res) return res;
  }
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
  return { ...mockSettings }; // Return copy to prevent direct mutation references
}

export async function updateSettings(partialData: Partial<AppSettings>): Promise<AppSettings> {
  if (isTauri()) {
    const res = await invokeTauri<AppSettings>("update_settings", { settings: partialData });
    if (res) return res;
  }
  await new Promise((resolve) => setTimeout(resolve, 600)); // slightly longer delay for writes
  
  // In dev mock environment, we just update the in-memory object (not persistent across reloads but works for demo)
  Object.assign(mockSettings, partialData);
  
  return { ...mockSettings };
}

// ─── Data Vault API (Import/Export/Wipe) ─────────────────────────

export async function exportDataVault(): Promise<boolean> {
  if (isTauri()) {
    const res = await invokeTauri<boolean>("export_data_vault");
    if (res !== null) return res;
  }
  // Simulate OS File Dialog and Export Delay
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return true;
}

export async function importDataVault(): Promise<boolean> {
  if (isTauri()) {
    const res = await invokeTauri<boolean>("import_data_vault");
    if (res !== null) return res;
  }
  // Simulate OS File Dialog and Import Delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return true;
}

export async function wipeAllData(): Promise<boolean> {
  if (isTauri()) {
    const res = await invokeTauri<boolean>("wipe_all_data");
    if (res !== null) return res;
  }
  // Simulate heavy database teardown delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
}

/**
 * Centralized Tauri IPC helper.
 * - In Tauri desktop: calls the Rust backend via invoke()
 * - In browser dev (npm run dev without Tauri): returns null → services fall back to mocks
 */

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function invokeTauri<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T | null> {
  if (!isTauri()) return null;

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (error) {
    console.warn(`[Tauri IPC] Failed: ${cmd}`, error);
    return null;
  }
}

export { isTauri };

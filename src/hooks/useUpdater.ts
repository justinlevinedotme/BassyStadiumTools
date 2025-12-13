import { useState, useCallback } from "react";
import { getVersion } from "@tauri-apps/api/app";

const LATEST_JSON_URL = "https://github.com/justinlevinedotme/BassyStadiumTools/releases/latest/download/latest.json";

interface UpdateInfo {
  version: string;
  currentVersion: string;
}

interface UpdateState {
  checking: boolean;
  available: boolean;
  update: UpdateInfo | null;
  error: string | null;
}

// Simple semver comparison: returns true if remote > current
function isNewerVersion(remote: string, current: string): boolean {
  const remoteParts = remote.split(".").map(Number);
  const currentParts = current.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const r = remoteParts[i] || 0;
    const c = currentParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    update: null,
    error: null,
  });

  const checkForUpdate = useCallback(async (): Promise<UpdateInfo | null> => {
    setState((prev) => ({ ...prev, checking: true, error: null }));
    try {
      const currentVersion = await getVersion();

      const response = await fetch(LATEST_JSON_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest.json: ${response.status}`);
      }

      const data = await response.json() as { version: string };
      const remoteVersion = data.version;

      if (isNewerVersion(remoteVersion, currentVersion)) {
        const update = { version: remoteVersion, currentVersion };
        setState((prev) => ({
          ...prev,
          checking: false,
          available: true,
          update,
        }));
        return update;
      } else {
        setState((prev) => ({
          ...prev,
          checking: false,
          available: false,
          update: null,
        }));
        return null;
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        checking: false,
        error: err instanceof Error ? err.message : "Failed to check for updates",
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    checkForUpdate,
  };
}

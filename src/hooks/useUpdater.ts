import { useState, useCallback, useRef } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";

interface UpdateState {
  checking: boolean;
  available: boolean;
  update: Update | null;
  downloading: boolean;
  progress: number;
  error: string | null;
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    update: null,
    downloading: false,
    progress: 0,
    error: null,
  });

  const contentLengthRef = useRef(0);
  const downloadedRef = useRef(0);

  const checkForUpdate = useCallback(async () => {
    setState((prev) => ({ ...prev, checking: true, error: null }));
    try {
      const update = await check();
      if (update) {
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

  const downloadAndInstall = useCallback(async () => {
    if (!state.update) {
      console.error("[Updater] No update available to install");
      return;
    }

    console.log("[Updater] Starting downloadAndInstall...");
    console.log("[Updater] Update info:", {
      version: state.update.version,
      currentVersion: state.update.currentVersion,
    });

    setState((prev) => ({ ...prev, downloading: true, progress: 0 }));
    contentLengthRef.current = 0;
    downloadedRef.current = 0;

    try {
      await state.update.downloadAndInstall((event) => {
        console.log("[Updater] Event:", event.event);
        if (event.event === "Started") {
          contentLengthRef.current = event.data.contentLength || 0;
          downloadedRef.current = 0;
          console.log("[Updater] Download started, size:", contentLengthRef.current);
        } else if (event.event === "Progress") {
          downloadedRef.current += event.data.chunkLength;
          if (contentLengthRef.current > 0) {
            const progress = (downloadedRef.current / contentLengthRef.current) * 100;
            setState((prev) => ({ ...prev, progress: Math.min(progress, 100) }));
          }
        } else if (event.event === "Finished") {
          console.log("[Updater] Download finished, installing...");
          setState((prev) => ({ ...prev, progress: 100 }));
        }
      });
      console.log("[Updater] downloadAndInstall completed - app should exit for install");
    } catch (err) {
      console.error("[Updater] downloadAndInstall error:", err);
      setState((prev) => ({
        ...prev,
        downloading: false,
        error: err instanceof Error ? err.message : "Failed to download update",
      }));
    }
  }, [state.update]);

  return {
    ...state,
    checkForUpdate,
    downloadAndInstall,
  };
}

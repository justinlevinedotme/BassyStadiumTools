import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface DownloadProgress {
  downloaded: number;
  total: number;
  speed_bps: number;
  percent: number;
}

interface DownloadState {
  downloading: boolean;
  progress: number; // 0-100
  speed: string; // formatted speed like "1.2 MB/s"
  downloaded: string; // formatted like "5.2 MB"
  total: string; // formatted like "50 MB"
  error: string | null;
  canCancel: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + "/s";
}

export function useBepInExDownload() {
  const [state, setState] = useState<DownloadState>({
    downloading: false,
    progress: 0,
    speed: "",
    downloaded: "",
    total: "",
    error: null,
    canCancel: false,
  });

  // Listen to download progress events
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      unlisten = await listen<DownloadProgress>("download-progress", (event) => {
        const { downloaded, total, speed_bps, percent } = event.payload;
        setState((prev) => ({
          ...prev,
          progress: Math.round(percent),
          speed: formatSpeed(speed_bps),
          downloaded: formatBytes(downloaded),
          total: formatBytes(total),
        }));
      });
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const downloadFromR2 = useCallback(async (): Promise<string> => {
    setState((prev) => ({
      ...prev,
      downloading: true,
      progress: 0,
      speed: "",
      downloaded: "",
      total: "",
      error: null,
      canCancel: true,
    }));

    try {
      const zipPath = await invoke<string>("download_bepinex_from_r2");
      setState((prev) => ({
        ...prev,
        downloading: false,
        canCancel: false,
      }));
      return zipPath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setState((prev) => ({
        ...prev,
        downloading: false,
        error: errorMessage,
        canCancel: false,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const downloadFromUrl = useCallback(async (url: string): Promise<string> => {
    setState((prev) => ({
      ...prev,
      downloading: true,
      progress: 0,
      speed: "",
      downloaded: "",
      total: "",
      error: null,
      canCancel: true,
    }));

    try {
      const zipPath = await invoke<string>("download_bepinex_from_url", { url });
      setState((prev) => ({
        ...prev,
        downloading: false,
        canCancel: false,
      }));
      return zipPath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setState((prev) => ({
        ...prev,
        downloading: false,
        error: errorMessage,
        canCancel: false,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const cancelDownload = useCallback(async () => {
    try {
      await invoke("cancel_download");
      setState((prev) => ({
        ...prev,
        downloading: false,
        canCancel: false,
        error: "Download cancelled",
      }));
    } catch (err) {
      console.error("Failed to cancel download:", err);
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    downloadFromR2,
    downloadFromUrl,
    cancelDownload,
    clearError,
  };
}

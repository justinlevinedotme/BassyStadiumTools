import { useEffect } from "react";
import { useUpdater } from "@/hooks/useUpdater";
import { toast } from "sonner";
import { relaunch } from "@tauri-apps/plugin-process";

export function UpdateChecker() {
  const { checkForUpdate, downloadAndInstall, downloading, progress } = useUpdater();

  useEffect(() => {
    console.log("[Updater] Component mounted");

    const checkUpdate = async () => {
      console.log("[Updater] Checking for updates...");
      try {
        const available = await checkForUpdate();
        if (available) {
          console.log(`[Updater] Update available: v${available.version}`);
          toast.info(`Update available: v${available.version}`, {
            description: "A new version is ready to download.",
            duration: Infinity,
            action: {
              label: "Download",
              onClick: () => {
                handleDownload();
              },
            },
          });
        } else {
          console.log("[Updater] No updates available, app is up to date");
        }
      } catch (err) {
        console.error("[Updater] Failed to check for updates:", err);
      }
    };

    // Small delay to let app fully initialize
    console.log("[Updater] Setting up 2s timer...");
    const timer = setTimeout(checkUpdate, 2000);

    return () => {
      console.log("[Updater] Cleanup - clearing timer");
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    const toastId = toast.loading("Downloading update...", {
      description: "0%",
    });

    try {
      await downloadAndInstall();
      toast.success("Update downloaded!", {
        id: toastId,
        description: "Restart to apply the update.",
        action: {
          label: "Restart",
          onClick: async () => {
            await relaunch();
          },
        },
      });
    } catch {
      toast.error("Failed to download update", {
        id: toastId,
      });
    }
  };

  // Update toast with download progress
  useEffect(() => {
    if (downloading && progress > 0 && progress < 100) {
      toast.loading("Downloading update...", {
        description: `${Math.round(progress)}%`,
      });
    }
  }, [downloading, progress]);

  return null;
}

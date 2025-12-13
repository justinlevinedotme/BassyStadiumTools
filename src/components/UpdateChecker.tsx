import { useEffect } from "react";
import { useUpdater } from "@/hooks/useUpdater";
import { toast } from "sonner";
import { open } from "@tauri-apps/plugin-shell";

const RELEASES_URL = "https://github.com/justinlevinedotme/BassyStadiumTools/releases/latest";

export function UpdateChecker() {
  const { checkForUpdate } = useUpdater();

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const available = await checkForUpdate();
        if (available) {
          toast.info(`Update available: v${available.version}`, {
            description: "A new version is available.",
            duration: Infinity,
            action: {
              label: "Download",
              onClick: () => {
                open(RELEASES_URL);
              },
            },
          });
        }
      } catch (err) {
        console.error("[Updater] Failed to check for updates:", err);
      }
    };

    // Small delay to let app fully initialize
    const timer = setTimeout(checkUpdate, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

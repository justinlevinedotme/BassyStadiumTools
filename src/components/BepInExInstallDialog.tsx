import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBepInExDownload } from "@/hooks/useBepInExDownload";
import { Download, FileArchive, Link, AlertTriangle, X } from "lucide-react";
import type { Fm26Installation, BepInExStatus } from "@/types";

type InstallSource = "r2" | "local" | "url";

interface BepInExInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installation: Fm26Installation;
  onInstallComplete: () => void;
}

export function BepInExInstallDialog({
  open,
  onOpenChange,
  installation,
  onInstallComplete,
}: BepInExInstallDialogProps) {
  const [source, setSource] = useState<InstallSource>("r2");
  const [customUrl, setCustomUrl] = useState("");
  const [localPath, setLocalPath] = useState("");
  const [bepInExStatus, setBepInExStatus] = useState<BepInExStatus | null>(null);
  const [installing, setInstalling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    downloading,
    progress,
    speed,
    downloaded,
    total,
    error: downloadError,
    canCancel,
    downloadFromR2,
    downloadFromUrl,
    cancelDownload,
    clearError,
  } = useBepInExDownload();

  // Check existing BepInEx status when dialog opens
  useEffect(() => {
    if (open && installation) {
      invoke<BepInExStatus>("check_bepinex_installed", { install: installation })
        .then(setBepInExStatus)
        .catch(console.error);
    }
  }, [open, installation]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSource("r2");
      setCustomUrl("");
      setLocalPath("");
      setShowConfirm(false);
      clearError();
    }
  }, [open, clearError]);

  const handleBrowseLocal = async () => {
    try {
      const selected = await openFileDialog({
        multiple: false,
        title: "Select BepInEx Pack Zip File",
        filters: [{ name: "Zip Archives", extensions: ["zip"] }],
      });

      if (selected && typeof selected === "string") {
        setLocalPath(selected);
      }
    } catch (err) {
      console.error("Failed to open file picker:", err);
    }
  };

  const handleInstall = async () => {
    // Show confirmation if BepInEx already installed
    if (bepInExStatus?.installed && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setInstalling(true);
    clearError();

    try {
      let zipPath: string | null = null;

      // Get zip file based on source
      if (source === "r2") {
        zipPath = await downloadFromR2();
      } else if (source === "url") {
        if (!customUrl) {
          throw new Error("Please enter a URL");
        }
        zipPath = await downloadFromUrl(customUrl);
      } else if (source === "local") {
        if (!localPath) {
          throw new Error("Please select a local file");
        }
        zipPath = localPath;
      }

      // Install the pack
      await invoke("install_bepinex_pack", {
        zipPath,
        appHandle: null, // Tauri handles this
        install: installation,
      });

      toast.success("BepInEx Stadium Pack installed!");
      onInstallComplete();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message !== "Download cancelled") {
        toast.error("Installation failed", { description: message });
      }
    } finally {
      setInstalling(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    if (downloading && canCancel) {
      cancelDownload();
    } else {
      onOpenChange(false);
    }
  };

  const isButtonDisabled = () => {
    if (installing || downloading) return true;
    if (source === "url" && !customUrl) return true;
    if (source === "local" && !localPath) return true;
    return false;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Install Stadium Pack</AlertDialogTitle>
          <AlertDialogDescription>
            Choose how to install the BepInEx stadium and audio mod pack.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Overwrite Warning */}
        {bepInExStatus?.installed && !showConfirm && (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              BepInEx is already installed with {bepInExStatus.plugin_count} plugin(s).
              Installing will replace existing files.
            </AlertDescription>
          </Alert>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Are you sure?</strong> This will overwrite your existing BepInEx installation
              at <code className="text-xs">{bepInExStatus?.path}</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Download Progress */}
        {downloading && (
          <div className="space-y-2 my-4">
            <div className="flex justify-between text-sm">
              <span>Downloading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{downloaded} / {total}</span>
              <span>{speed}</span>
            </div>
          </div>
        )}

        {/* Source Selection */}
        {!downloading && !showConfirm && (
          <div className="space-y-4 my-4">
            {/* R2 Download */}
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                source === "r2"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSource("r2")}
            >
              <Download className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">Download from server</div>
                <div className="text-sm text-muted-foreground">
                  Recommended. Downloads the latest pack (~50 MB).
                </div>
              </div>
            </div>

            {/* Local File */}
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                source === "local"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSource("local")}
            >
              <FileArchive className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">Use local zip file</div>
                <div className="text-sm text-muted-foreground">
                  Select a BepInEx pack you've already downloaded.
                </div>
                {source === "local" && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrowseLocal();
                      }}
                    >
                      Browse...
                    </Button>
                    {localPath && (
                      <div className="mt-1 text-xs text-muted-foreground truncate max-w-[250px]">
                        {localPath}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Custom URL */}
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                source === "url"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSource("url")}
            >
              <Link className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">Custom URL</div>
                <div className="text-sm text-muted-foreground">
                  Download from a different source or custom pack.
                </div>
                {source === "url" && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <Label htmlFor="customUrl" className="sr-only">
                      URL
                    </Label>
                    <Input
                      id="customUrl"
                      placeholder="https://example.com/bepinex_pack.zip"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {downloadError && (
          <Alert variant="destructive" className="my-2">
            <AlertDescription>{downloadError}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={installing && !canCancel}>
            {downloading && canCancel ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel Download
              </>
            ) : (
              "Cancel"
            )}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleInstall}
            disabled={isButtonDisabled()}
          >
            {installing || downloading ? (
              "Installing..."
            ) : showConfirm ? (
              "Confirm & Install"
            ) : (
              "Install"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

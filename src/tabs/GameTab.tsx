import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Download, RefreshCw, AlertCircle, CheckCircle2, FileArchive, Search } from "lucide-react";
import type { Fm26Installation, PluginStatus } from "@/types";

const STORAGE_KEY = "fm26_install_path";

export function GameTab() {
  const [installPath, setInstallPath] = useState<string>("");
  const [installation, setInstallation] = useState<Fm26Installation | null>(null);
  const [plugins, setPlugins] = useState<PluginStatus[]>([]);
  const [detectedPaths, setDetectedPaths] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstallingStadiums, setIsInstallingStadiums] = useState(false);

  // Load saved path on mount, or try auto-detect
  useEffect(() => {
    const savedPath = localStorage.getItem(STORAGE_KEY);
    if (savedPath) {
      setInstallPath(savedPath);
      validateAndLoadInstallation(savedPath);
    } else {
      // No saved path, try auto-detection
      handleAutoDetect();
    }
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const paths = await invoke<string[]>("detect_fm26_paths");
      setDetectedPaths(paths);

      // If exactly one path found, auto-select it
      if (paths.length === 1) {
        setInstallPath(paths[0]);
        await validateAndLoadInstallation(paths[0]);
      }
    } catch (err) {
      // Silent fail for auto-detect - user can browse manually
      console.error("Auto-detect failed:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const validateAndLoadInstallation = async (path: string) => {
    if (!path) return;

    setIsLoading(true);
    setError(null);

    try {
      const install = await invoke<Fm26Installation>("inspect_fm26_install", {
        rootPath: path,
      });
      setInstallation(install);

      // Load plugin status
      const pluginStatus = await invoke<PluginStatus[]>("get_plugin_status", {
        install,
      });
      setPlugins(pluginStatus);

      // Save path to localStorage
      localStorage.setItem(STORAGE_KEY, path);
    } catch (err) {
      setError(String(err));
      setInstallation(null);
      setPlugins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select FM26 Installation Directory",
      });

      if (selected && typeof selected === "string") {
        setInstallPath(selected);
        await validateAndLoadInstallation(selected);
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const handleInstall = async () => {
    if (!installation) return;

    setIsInstalling(true);
    setError(null);
    setSuccess(null);

    try {
      await invoke("install_bepinex_pack", { install: installation });
      setSuccess("BepInEx Stadium Pack installed successfully!");

      // Refresh plugin status
      const pluginStatus = await invoke<PluginStatus[]>("get_plugin_status", {
        install: installation,
      });
      setPlugins(pluginStatus);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsInstalling(false);
    }
  };

  const handleRefresh = async () => {
    if (installPath) {
      await validateAndLoadInstallation(installPath);
    }
  };

  const handleInstallCustomStadiums = async () => {
    if (!installation) return;

    try {
      const selected = await open({
        multiple: false,
        title: "Select Custom Stadiums Zip File",
        filters: [{ name: "Zip Archives", extensions: ["zip"] }],
      });

      if (selected && typeof selected === "string") {
        setIsInstallingStadiums(true);
        setError(null);
        setSuccess(null);

        const filesExtracted = await invoke<number>("install_custom_stadiums_pack", {
          zipPath: selected,
          install: installation,
        });

        setSuccess(`Custom stadiums installed successfully! (${filesExtracted} files extracted)`);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsInstallingStadiums(false);
    }
  };

  const bepInExInstalled = plugins.length > 0 && plugins.some((p) => p.installed);

  return (
    <div className="space-y-4 pt-4">
      {/* FM26 Path Selection */}
      <Card>
        <CardHeader>
          <CardTitle>FM26 Installation</CardTitle>
          <CardDescription>
            Select your Football Manager 2026 installation directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-detected paths dropdown */}
          {detectedPaths.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Found {detectedPaths.length} FM26 installation{detectedPaths.length > 1 ? "s" : ""}</span>
              </div>
              {detectedPaths.length > 1 && (
                <Select
                  value={installPath}
                  onValueChange={(value) => {
                    setInstallPath(value);
                    validateAndLoadInstallation(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select detected installation" />
                  </SelectTrigger>
                  <SelectContent>
                    {detectedPaths.map((path) => (
                      <SelectItem key={path} value={path}>
                        {path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={installPath}
              onChange={(e) => setInstallPath(e.target.value)}
              placeholder="C:\Program Files\Steam\steamapps\common\Football Manager 2026"
              className="flex-1"
            />
            <Button
              onClick={handleAutoDetect}
              variant="outline"
              disabled={isDetecting}
              title="Auto-detect FM26 installation"
            >
              <Search className={`h-4 w-4 ${isDetecting ? "animate-pulse" : ""}`} />
            </Button>
            <Button onClick={handleBrowse} variant="outline">
              <FolderOpen className="mr-2 h-4 w-4" />
              Browse
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={!installPath || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* BepInEx Status & Install */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stadium Pack</span>
            {installation && (
              <Badge variant={bepInExInstalled ? "success" : "secondary"}>
                {bepInExInstalled ? "Installed" : "Not Installed"}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Install or repair the BepInEx stadium and audio mod pack
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleInstall}
            disabled={!installation || isInstalling}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isInstalling
              ? "Installing..."
              : bepInExInstalled
                ? "Repair Stadium Pack"
                : "Install Stadium Pack"}
          </Button>
          {!installation && (
            <p className="mt-2 text-sm text-muted-foreground">
              Select your FM26 installation directory first
            </p>
          )}
        </CardContent>
      </Card>

      {/* Custom Stadiums Install */}
      {installation && bepInExInstalled && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Stadiums</CardTitle>
            <CardDescription>
              Install custom stadium bundles from a zip file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleInstallCustomStadiums}
              disabled={isInstallingStadiums}
              variant="outline"
              className="w-full"
            >
              <FileArchive className="mr-2 h-4 w-4" />
              {isInstallingStadiums
                ? "Installing Stadiums..."
                : "Select & Install Custom Stadiums Zip"}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Extracts .bundle files to BepInEx/plugins/CustomStadium/
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plugin Status */}
      {installation && (
        <Card>
          <CardHeader>
            <CardTitle>Plugin Status</CardTitle>
            <CardDescription>
              Status of installed BepInEx plugins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plugin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Path</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plugins.map((plugin) => (
                  <TableRow key={plugin.name}>
                    <TableCell className="font-medium">{plugin.name}</TableCell>
                    <TableCell>
                      <Badge variant={plugin.installed ? "success" : "destructive"}>
                        {plugin.installed ? "Installed" : "Missing"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {plugin.path}
                    </TableCell>
                  </TableRow>
                ))}
                {plugins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No plugins detected. Install the Stadium Pack first.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

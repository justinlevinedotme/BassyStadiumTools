import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, AlertCircle, CheckCircle2, Save, Settings } from "lucide-react";
import type { Fm26Installation, StadiumInjectionConfig, BundleInfo } from "@/types";

const STORAGE_KEY = "fm26_install_path";

export function ConfigsTab() {
  const [installation, setInstallation] = useState<Fm26Installation | null>(null);
  const [config, setConfig] = useState<StadiumInjectionConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<StadiumInjectionConfig | null>(null);
  const [bundles, setBundles] = useState<BundleInfo[]>([]);
  const [configFiles, setConfigFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load installation on mount
  useEffect(() => {
    const savedPath = localStorage.getItem(STORAGE_KEY);
    if (savedPath) {
      loadInstallation(savedPath);
    }
  }, []);

  const loadInstallation = async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const install = await invoke<Fm26Installation>("inspect_fm26_install", {
        rootPath: path,
      });
      setInstallation(install);
      await loadData(install);
    } catch (err) {
      setError(String(err));
      setInstallation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async (install: Fm26Installation) => {
    try {
      const [cfg, bundleList, cfgFiles] = await Promise.all([
        invoke<StadiumInjectionConfig>("read_stadium_injection_config", { install }),
        invoke<BundleInfo[]>("list_bundles", { install }),
        invoke<string[]>("list_config_files", { install }),
      ]);
      setConfig(cfg);
      setOriginalConfig(cfg);
      setBundles(bundleList);
      setConfigFiles(cfgFiles);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleRefresh = async () => {
    if (installation) {
      setIsLoading(true);
      await loadData(installation);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!installation || !config) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await invoke("write_stadium_injection_config", {
        install: installation,
        config,
      });
      setSuccess("Configuration saved successfully!");
      setOriginalConfig(config);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      setSuccess(null);
      setError(null);
    }
  };

  const updateConfig = (updates: Partial<StadiumInjectionConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  const hasChanges = config && originalConfig
    ? JSON.stringify(config) !== JSON.stringify(originalConfig)
    : false;

  if (!installation) {
    return (
      <div className="space-y-4 pt-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Installation Selected</AlertTitle>
          <AlertDescription>
            Please select your FM26 installation directory in the Game tab first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
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

      <div className="grid gap-4 md:grid-cols-2">
        {/* Stadium Injection Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Stadium Injection</span>
              <Badge variant={hasChanges ? "secondary" : "outline"}>
                {hasChanges ? "Unsaved Changes" : "Saved"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure the StadiumInjection BepInEx plugin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {config && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableCustomStadiums">Enable Custom Stadiums</Label>
                      <p className="text-xs text-muted-foreground">
                        Turn on/off custom stadium injection
                      </p>
                    </div>
                    <Switch
                      id="enableCustomStadiums"
                      checked={config.enable_custom_stadiums}
                      onCheckedChange={(checked) =>
                        updateConfig({ enable_custom_stadiums: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="replaceAll">Replace All Stadiums</Label>
                      <p className="text-xs text-muted-foreground">
                        Use default bundle for all matches
                      </p>
                    </div>
                    <Switch
                      id="replaceAll"
                      checked={config.replace_all_stadiums}
                      onCheckedChange={(checked) =>
                        updateConfig({ replace_all_stadiums: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultBundle">Default Bundle</Label>
                    <Select
                      value={config.default_bundle || "none"}
                      onValueChange={(value) =>
                        updateConfig({ default_bundle: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger id="defaultBundle">
                        <SelectValue placeholder="Select default bundle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {bundles.map((bundle) => (
                          <SelectItem key={bundle.file_name} value={bundle.file_name}>
                            {bundle.file_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Used when no team mapping exists
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="customPitch">Custom Pitch Dimensions</Label>
                      <p className="text-xs text-muted-foreground">
                        Override default pitch size
                      </p>
                    </div>
                    <Switch
                      id="customPitch"
                      checked={config.use_custom_pitch_dimensions}
                      onCheckedChange={(checked) =>
                        updateConfig({ use_custom_pitch_dimensions: checked })
                      }
                    />
                  </div>

                  {config.use_custom_pitch_dimensions && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pitchLength">Length (m)</Label>
                        <Input
                          id="pitchLength"
                          type="number"
                          value={config.pitch_length}
                          onChange={(e) =>
                            updateConfig({ pitch_length: parseInt(e.target.value) || 105 })
                          }
                          min={90}
                          max={120}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pitchWidth">Width (m)</Label>
                        <Input
                          id="pitchWidth"
                          type="number"
                          value={config.pitch_width}
                          onChange={(e) =>
                            updateConfig({ pitch_width: parseInt(e.target.value) || 68 })
                          }
                          min={45}
                          max={90}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={handleRevert} variant="outline" size="sm" disabled={!hasChanges}>
                    Revert
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={!hasChanges || isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Config Files List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Config Files</span>
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              BepInEx plugin configuration files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {configFiles.length > 0 ? (
                <ul className="space-y-2">
                  {configFiles.map((file) => (
                    <li
                      key={file}
                      className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{file}</span>
                      {file === "StadiumInjection.cfg" && (
                        <Badge variant="outline" className="ml-auto">
                          Active
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No config files found. Install BepInEx plugins first.
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Config files are located in:
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                {installation.config_path}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

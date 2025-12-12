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
import { RefreshCw, AlertCircle, CheckCircle2, Save, Settings, Volume2, Users, LayoutGrid } from "lucide-react";
import type { Fm26Installation, StadiumInjectionConfig, BundleInfo, AudioInjectConfig, CrowdInjectConfig, AdboardsConfig } from "@/types";

const STORAGE_KEY = "fm26_install_path";

export function ConfigsTab() {
  const [installation, setInstallation] = useState<Fm26Installation | null>(null);
  const [stadiumConfig, setStadiumConfig] = useState<StadiumInjectionConfig | null>(null);
  const [originalStadiumConfig, setOriginalStadiumConfig] = useState<StadiumInjectionConfig | null>(null);
  const [audioConfig, setAudioConfig] = useState<AudioInjectConfig | null>(null);
  const [originalAudioConfig, setOriginalAudioConfig] = useState<AudioInjectConfig | null>(null);
  const [crowdConfig, setCrowdConfig] = useState<CrowdInjectConfig | null>(null);
  const [originalCrowdConfig, setOriginalCrowdConfig] = useState<CrowdInjectConfig | null>(null);
  const [adboardsConfig, setAdboardsConfig] = useState<AdboardsConfig | null>(null);
  const [originalAdboardsConfig, setOriginalAdboardsConfig] = useState<AdboardsConfig | null>(null);
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
      const [stadiumCfg, audioCfg, crowdCfg, adboardsCfg, bundleList, cfgFiles] = await Promise.all([
        invoke<StadiumInjectionConfig>("read_stadium_injection_config", { install }),
        invoke<AudioInjectConfig>("read_audio_inject_config", { install }),
        invoke<CrowdInjectConfig>("read_crowd_inject_config", { install }),
        invoke<AdboardsConfig>("read_adboards_config", { install }),
        invoke<BundleInfo[]>("list_bundles", { install }),
        invoke<string[]>("list_config_files", { install }),
      ]);
      setStadiumConfig(stadiumCfg);
      setOriginalStadiumConfig(stadiumCfg);
      setAudioConfig(audioCfg);
      setOriginalAudioConfig(audioCfg);
      setCrowdConfig(crowdCfg);
      setOriginalCrowdConfig(crowdCfg);
      setAdboardsConfig(adboardsCfg);
      setOriginalAdboardsConfig(adboardsCfg);
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

  const handleSaveAll = async () => {
    if (!installation) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = [];

      if (hasStadiumChanges && stadiumConfig) {
        promises.push(invoke("write_stadium_injection_config", { install: installation, config: stadiumConfig }));
      }
      if (hasAudioChanges && audioConfig) {
        promises.push(invoke("write_audio_inject_config", { install: installation, config: audioConfig }));
      }
      if (hasCrowdChanges && crowdConfig) {
        promises.push(invoke("write_crowd_inject_config", { install: installation, config: crowdConfig }));
      }
      if (hasAdboardsChanges && adboardsConfig) {
        promises.push(invoke("write_adboards_config", { install: installation, config: adboardsConfig }));
      }

      await Promise.all(promises);

      setSuccess("All configurations saved successfully!");
      setOriginalStadiumConfig(stadiumConfig);
      setOriginalAudioConfig(audioConfig);
      setOriginalCrowdConfig(crowdConfig);
      setOriginalAdboardsConfig(adboardsConfig);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevertAll = () => {
    setStadiumConfig(originalStadiumConfig);
    setAudioConfig(originalAudioConfig);
    setCrowdConfig(originalCrowdConfig);
    setAdboardsConfig(originalAdboardsConfig);
    setSuccess(null);
    setError(null);
  };

  const updateStadiumConfig = (updates: Partial<StadiumInjectionConfig>) => {
    if (stadiumConfig) {
      setStadiumConfig({ ...stadiumConfig, ...updates });
    }
  };

  const updateAudioConfig = (updates: Partial<AudioInjectConfig>) => {
    if (audioConfig) {
      setAudioConfig({ ...audioConfig, ...updates });
    }
  };

  const updateCrowdConfig = (updates: Partial<CrowdInjectConfig>) => {
    if (crowdConfig) {
      setCrowdConfig({ ...crowdConfig, ...updates });
    }
  };

  const updateAdboardsConfig = (updates: Partial<AdboardsConfig>) => {
    if (adboardsConfig) {
      setAdboardsConfig({ ...adboardsConfig, ...updates });
    }
  };

  const hasStadiumChanges = stadiumConfig && originalStadiumConfig
    ? JSON.stringify(stadiumConfig) !== JSON.stringify(originalStadiumConfig)
    : false;

  const hasAudioChanges = audioConfig && originalAudioConfig
    ? JSON.stringify(audioConfig) !== JSON.stringify(originalAudioConfig)
    : false;

  const hasCrowdChanges = crowdConfig && originalCrowdConfig
    ? JSON.stringify(crowdConfig) !== JSON.stringify(originalCrowdConfig)
    : false;

  const hasAdboardsChanges = adboardsConfig && originalAdboardsConfig
    ? JSON.stringify(adboardsConfig) !== JSON.stringify(originalAdboardsConfig)
    : false;

  const hasAnyChanges = hasStadiumChanges || hasAudioChanges || hasCrowdChanges || hasAdboardsChanges;

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

      {/* Global Save/Revert Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {hasAnyChanges ? "You have unsaved changes" : "All changes saved"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleRevertAll} variant="outline" size="sm" disabled={!hasAnyChanges}>
            Revert All
          </Button>
          <Button onClick={handleSaveAll} size="sm" disabled={!hasAnyChanges || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Audio Inject Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <span>Audio Inject</span>
              </div>
              <Badge variant={hasAudioChanges ? "secondary" : "outline"}>
                {hasAudioChanges ? "Modified" : "Saved"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure custom audio injection (anthems, goal sounds)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {audioConfig && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAudio">Enable Audio Injection</Label>
                    <p className="text-xs text-muted-foreground">
                      Master toggle for custom audio
                    </p>
                  </div>
                  <Switch
                    id="enableAudio"
                    checked={audioConfig.enable_audio_injection}
                    onCheckedChange={(checked) =>
                      updateAudioConfig({ enable_audio_injection: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="masterVolume">Master Volume</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="masterVolume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={audioConfig.master_volume}
                      onChange={(e) =>
                        updateAudioConfig({ master_volume: parseFloat(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{Math.round(audioConfig.master_volume * 100)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="musicVolume">Music Volume</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="musicVolume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={audioConfig.music_volume}
                      onChange={(e) =>
                        updateAudioConfig({ music_volume: parseFloat(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{Math.round(audioConfig.music_volume * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Anthems, halftime music</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventVolume">Event Volume</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="eventVolume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={audioConfig.event_volume}
                      onChange={(e) =>
                        updateAudioConfig({ event_volume: parseFloat(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{Math.round(audioConfig.event_volume * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Goals, crowd reactions</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="loopMusic">Loop Music</Label>
                    <p className="text-xs text-muted-foreground">
                      Repeat music tracks
                    </p>
                  </div>
                  <Switch
                    id="loopMusic"
                    checked={audioConfig.loop_music}
                    onCheckedChange={(checked) =>
                      updateAudioConfig({ loop_music: checked })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Crowd Inject Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Crowd Inject</span>
              </div>
              <Badge variant={hasCrowdChanges ? "secondary" : "outline"}>
                {hasCrowdChanges ? "Modified" : "Saved"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure crowd rendering in custom stadiums
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {crowdConfig && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableCrowd">Enable Crowd Injection</Label>
                    <p className="text-xs text-muted-foreground">
                      Render crowds in custom stadiums
                    </p>
                  </div>
                  <Switch
                    id="enableCrowd"
                    checked={crowdConfig.enable_crowd_injection}
                    onCheckedChange={(checked) =>
                      updateCrowdConfig({ enable_crowd_injection: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crowdDensity">Crowd Density</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="crowdDensity"
                      type="range"
                      min={10}
                      max={100}
                      step={10}
                      value={crowdConfig.crowd_density}
                      onChange={(e) =>
                        updateCrowdConfig({ crowd_density: parseInt(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{crowdConfig.crowd_density}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Lower = fewer people, better performance</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fullCapacity">Always Full Capacity</Label>
                    <p className="text-xs text-muted-foreground">
                      Ignore actual match attendance
                    </p>
                  </div>
                  <Switch
                    id="fullCapacity"
                    checked={crowdConfig.always_full_capacity}
                    onCheckedChange={(checked) =>
                      updateCrowdConfig({ always_full_capacity: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skipRate">Crowd Skip Rate</Label>
                  <Select
                    value={String(crowdConfig.crowd_skip_rate)}
                    onValueChange={(value) =>
                      updateCrowdConfig({ crowd_skip_rate: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="skipRate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (All seats - Best quality)</SelectItem>
                      <SelectItem value="2">2 (50% seats)</SelectItem>
                      <SelectItem value="4">4 (25% seats - Recommended)</SelectItem>
                      <SelectItem value="8">8 (12.5% seats - Best performance)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Higher = better FPS, sparser crowd</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="teamColors">Use Team Colors</Label>
                    <p className="text-xs text-muted-foreground">
                      Fans wear team colors
                    </p>
                  </div>
                  <Switch
                    id="teamColors"
                    checked={crowdConfig.use_team_colors}
                    onCheckedChange={(checked) =>
                      updateCrowdConfig({ use_team_colors: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="billboards">Use Billboards</Label>
                    <p className="text-xs text-muted-foreground">
                      2D sprites instead of 3D models
                    </p>
                  </div>
                  <Switch
                    id="billboards"
                    checked={crowdConfig.use_billboards}
                    onCheckedChange={(checked) =>
                      updateCrowdConfig({ use_billboards: checked })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Adboards Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                <span>Adboards</span>
              </div>
              <Badge variant={hasAdboardsChanges ? "secondary" : "outline"}>
                {hasAdboardsChanges ? "Modified" : "Saved"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure advertising boards display
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adboardsConfig && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="disableAdboards">Hide All Adboards</Label>
                  <p className="text-xs text-muted-foreground">
                    Useful for stadiums with built-in ads or better performance
                  </p>
                </div>
                <Switch
                  id="disableAdboards"
                  checked={adboardsConfig.disable_adboards}
                  onCheckedChange={(checked) =>
                    updateAdboardsConfig({ disable_adboards: checked })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stadium Injection Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Stadium Injection</span>
              <Badge variant={hasStadiumChanges ? "secondary" : "outline"}>
                {hasStadiumChanges ? "Modified" : "Saved"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure custom stadium loading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stadiumConfig && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableCustomStadiums">Enable Custom Stadiums</Label>
                    <p className="text-xs text-muted-foreground">
                      Turn on/off custom stadium injection
                    </p>
                  </div>
                  <Switch
                    id="enableCustomStadiums"
                    checked={stadiumConfig.enable_custom_stadiums}
                    onCheckedChange={(checked) =>
                      updateStadiumConfig({ enable_custom_stadiums: checked })
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
                    checked={stadiumConfig.replace_all_stadiums}
                    onCheckedChange={(checked) =>
                      updateStadiumConfig({ replace_all_stadiums: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultBundle">Default Bundle</Label>
                  <Select
                    value={stadiumConfig.default_bundle || "none"}
                    onValueChange={(value) =>
                      updateStadiumConfig({ default_bundle: value === "none" ? "" : value })
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
                      checked={stadiumConfig.use_custom_pitch_dimensions}
                      onCheckedChange={(checked) =>
                        updateStadiumConfig({ use_custom_pitch_dimensions: checked })
                      }
                    />
                  </div>

                  {stadiumConfig.use_custom_pitch_dimensions && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pitchLength">Length (m)</Label>
                        <Input
                          id="pitchLength"
                          type="number"
                          value={stadiumConfig.pitch_length}
                          onChange={(e) =>
                            updateStadiumConfig({ pitch_length: parseInt(e.target.value) || 105 })
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
                          value={stadiumConfig.pitch_width}
                          onChange={(e) =>
                            updateStadiumConfig({ pitch_width: parseInt(e.target.value) || 68 })
                          }
                          min={45}
                          max={90}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Config Files List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>Config Files</span>
            </CardTitle>
            <CardDescription>
              BepInEx plugin configuration files in {installation.config_path}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {configFiles.length > 0 ? (
                configFiles.map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-xs truncate">{file}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 md:col-span-3">
                  No config files found. Install BepInEx plugins first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

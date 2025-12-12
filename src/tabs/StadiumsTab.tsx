import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, AlertCircle, FolderOpen, Plus, Trash2, Save, FileArchive } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Fm26Installation, BundleInfo, TeamMapping } from "@/types";

const STORAGE_KEY = "fm26_install_path";

export function StadiumsTab() {
  const [installation, setInstallation] = useState<Fm26Installation | null>(null);
  const [bundles, setBundles] = useState<BundleInfo[]>([]);
  const [mappings, setMappings] = useState<TeamMapping[]>([]);
  const [originalMappings, setOriginalMappings] = useState<TeamMapping[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInstallingStadiums, setIsInstallingStadiums] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
      const [bundleList, mappingList] = await Promise.all([
        invoke<BundleInfo[]>("list_bundles", { install }),
        invoke<TeamMapping[]>("read_team_mappings", { install }),
      ]);
      setBundles(bundleList);
      setMappings(mappingList);
      setOriginalMappings(mappingList);
      validateMappings(mappingList, bundleList);
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

  const handleOpenFolder = async () => {
    if (installation) {
      try {
        await open(installation.custom_stadium_path);
      } catch (err) {
        setError(String(err));
      }
    }
  };

  const validateMappings = (mappingList: TeamMapping[], bundleList: BundleInfo[]) => {
    const errors: string[] = [];
    const seenIds = new Set<number>();
    const bundleNames = new Set(bundleList.map(b => b.file_name));

    for (const mapping of mappingList) {
      if (seenIds.has(mapping.team_id)) {
        errors.push(`Duplicate team ID: ${mapping.team_id}`);
      }
      seenIds.add(mapping.team_id);

      if (!bundleNames.has(mapping.bundle_file)) {
        errors.push(`Bundle not found: ${mapping.bundle_file} (team ${mapping.team_id})`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleMappingChange = (index: number, field: keyof TeamMapping, value: string | number) => {
    const newMappings = [...mappings];
    if (field === "team_id") {
      newMappings[index] = { ...newMappings[index], team_id: Number(value) };
    } else {
      newMappings[index] = { ...newMappings[index], bundle_file: String(value) };
    }
    setMappings(newMappings);
    validateMappings(newMappings, bundles);
  };

  const handleAddMapping = () => {
    const newMapping: TeamMapping = {
      team_id: 0,
      bundle_file: bundles.length > 0 ? bundles[0].file_name : "",
    };
    const newMappings = [...mappings, newMapping];
    setMappings(newMappings);
    validateMappings(newMappings, bundles);
  };

  const handleRemoveMapping = (index: number) => {
    const newMappings = mappings.filter((_, i) => i !== index);
    setMappings(newMappings);
    validateMappings(newMappings, bundles);
  };

  const handleSave = async () => {
    if (!installation || validationErrors.length > 0) return;

    setIsSaving(true);
    setError(null);

    try {
      await invoke("write_team_mappings", {
        install: installation,
        mappings,
      });
      toast.success("Team mappings saved successfully!");
      setOriginalMappings(mappings);
    } catch (err) {
      toast.error("Failed to save mappings", { description: String(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    setMappings(originalMappings);
    validateMappings(originalMappings, bundles);
    setError(null);
  };

  const handleInstallCustomStadiums = async () => {
    if (!installation) return;

    try {
      const selected = await openDialog({
        multiple: false,
        title: "Select Custom Stadiums Zip File",
        filters: [{ name: "Zip Archives", extensions: ["zip"] }],
      });

      if (selected && typeof selected === "string") {
        setIsInstallingStadiums(true);
        setError(null);

        const filesExtracted = await invoke<number>("install_custom_stadiums_pack", {
          zipPath: selected,
          install: installation,
        });

        toast.success("Custom stadiums installed!", { description: `${filesExtracted} files extracted` });
        await loadData(installation);
      }
    } catch (err) {
      toast.error("Failed to install stadiums", { description: String(err) });
    } finally {
      setIsInstallingStadiums(false);
    }
  };

  const hasChanges = JSON.stringify(mappings) !== JSON.stringify(originalMappings);

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

      {/* Team Mappings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Team Mappings</span>
            <Badge variant={hasChanges ? "warning" : "outline"}>
              {hasChanges ? "Unsaved Changes" : "Saved"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Map team IDs to stadium bundles. Each team can only have one stadium.
            <span className="block mt-1">
              Need team IDs? Find them at{" "}
              <a
                href="https://fmref.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
                onClick={(e) => {
                  e.preventDefault();
                  open("https://fmref.com/");
                }}
              >
                fmref.com
              </a>{" "}
              by SortItOutSI.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Team ID</TableHead>
                  <TableHead>Bundle File</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        type="number"
                        value={mapping.team_id}
                        onChange={(e) => handleMappingChange(index, "team_id", e.target.value)}
                        className="w-24"
                        min={0}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={mapping.bundle_file}
                        onValueChange={(value) => handleMappingChange(index, "bundle_file", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bundle" />
                        </SelectTrigger>
                        <SelectContent>
                          {bundles.map((bundle) => (
                            <SelectItem key={bundle.file_name} value={bundle.file_name}>
                              {bundle.file_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMapping(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove mapping</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {mappings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No mappings configured. Add a mapping to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between pt-2">
            <Button onClick={handleAddMapping} variant="outline" disabled={bundles.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Mapping
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleRevert} variant="outline" disabled={!hasChanges}>
                Revert
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || validationErrors.length > 0 || isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Mappings"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stadium Bundles</span>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallCustomStadiums}
                disabled={isInstallingStadiums}
                size="sm"
              >
                {isInstallingStadiums ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileArchive className="mr-2 h-4 w-4" />
                )}
                {isInstallingStadiums ? "Installing..." : "Install from Zip"}
              </Button>
              <Button onClick={handleOpenFolder} variant="outline" size="sm">
                <FolderOpen className="mr-2 h-4 w-4" />
                Open Folder
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh bundles</TooltipContent>
              </Tooltip>
            </div>
          </CardTitle>
          <CardDescription>
            {bundles.length} bundle files found in CustomStadium folder
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading stadiums...</span>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bundle File</TableHead>
                    <TableHead>Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle) => (
                    <TableRow key={bundle.file_name}>
                      <TableCell className="font-medium">{bundle.file_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {bundle.modified || "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {bundles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No bundle files found. Install custom stadiums first.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

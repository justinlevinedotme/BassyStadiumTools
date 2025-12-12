import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, AlertCircle, Plus, Trash2, Save, Music } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ComingSoonOverlay } from "@/components/ComingSoonOverlay";
import type { Fm26Installation, AudioMapping, AudioFolderStatus } from "@/types";

const STORAGE_KEY = "fm26_install_path";

export function AudioTab() {
  const [installation, setInstallation] = useState<Fm26Installation | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<AudioMapping[]>([]);
  const [originalMappings, setOriginalMappings] = useState<AudioMapping[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderStatus, setFolderStatus] = useState<AudioFolderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      const [folderList, mappingList] = await Promise.all([
        invoke<string[]>("list_audio_folders", { install }),
        invoke<AudioMapping[]>("read_audio_mappings", { install }),
      ]);
      setFolders(folderList);
      setMappings(mappingList);
      setOriginalMappings(mappingList);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleRefresh = async () => {
    if (installation) {
      setIsLoading(true);
      await loadData(installation);
      setSelectedFolder(null);
      setFolderStatus(null);
      setIsLoading(false);
    }
  };

  const handleInspectFolder = async (folderName: string) => {
    if (!installation) return;

    setSelectedFolder(folderName);

    try {
      const status = await invoke<AudioFolderStatus>("inspect_audio_folder", {
        install: installation,
        folderName,
      });
      setFolderStatus(status);
    } catch (err) {
      setError(String(err));
      setFolderStatus(null);
    }
  };

  const handleMappingChange = (index: number, field: keyof AudioMapping, value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const handleAddMapping = () => {
    const newMapping: AudioMapping = {
      team_key: "",
      folder_name: folders.length > 0 ? folders[0] : "",
    };
    setMappings([...mappings, newMapping]);
  };

  const handleRemoveMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!installation) return;

    setIsSaving(true);
    setError(null);

    try {
      await invoke("write_audio_mappings", {
        install: installation,
        mappings,
      });
      toast.success("Audio mappings saved!");
      setOriginalMappings(mappings);
    } catch (err) {
      toast.error("Failed to save audio mappings", { description: String(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    setMappings(originalMappings);
    setError(null);
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

      <ComingSoonOverlay>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Audio Mappings */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Audio Mappings</span>
              <Badge variant={hasChanges ? "warning" : "success"}>
                {hasChanges ? "Unsaved Changes" : "Saved"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Map team keys to audio folders. Use * for default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Team Key</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={mapping.team_key}
                          onChange={(e) => handleMappingChange(index, "team_key", e.target.value)}
                          placeholder="* or ID"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mapping.folder_name}
                          onValueChange={(value) => handleMappingChange(index, "folder_name", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select folder" />
                          </SelectTrigger>
                          <SelectContent>
                            {folders.map((folder) => (
                              <SelectItem key={folder} value={folder}>
                                {folder}
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
                        No mappings configured.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-2">
              <Button onClick={handleAddMapping} variant="outline" size="sm" disabled={folders.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>

              <div className="flex gap-2">
                <Button onClick={handleRevert} variant="outline" size="sm" disabled={!hasChanges}>
                  Revert
                </Button>
                <Button onClick={handleSave} size="sm" disabled={!hasChanges || isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Folder Inspector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Folder Inspector</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh folders</TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              {folders.length} audio folders found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedFolder || ""} onValueChange={handleInspectFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder to inspect" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {folderStatus && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Required Files:</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">anthem.wav/ogg</span>
                    <Badge variant={folderStatus.anthem_exists ? "success" : "destructive"}>
                      {folderStatus.anthem_exists ? "Found" : "Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">goal_home.wav/ogg</span>
                    <Badge variant={folderStatus.goal_home_exists ? "success" : "destructive"}>
                      {folderStatus.goal_home_exists ? "Found" : "Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">goal_away.wav/ogg</span>
                    <Badge variant={folderStatus.goal_away_exists ? "success" : "destructive"}>
                      {folderStatus.goal_away_exists ? "Found" : "Missing"}
                    </Badge>
                  </div>
                </div>

                {folderStatus.other_files.length > 0 && (
                  <>
                    <div className="text-sm font-medium pt-2">Other Audio Files:</div>
                    <div className="max-h-32 overflow-y-auto">
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {folderStatus.other_files.map((file) => (
                          <li key={file} className="flex items-center gap-2">
                            <Music className="h-3 w-3" />
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}

            {!selectedFolder && folders.length > 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Select a folder above to inspect its contents.
              </p>
            )}

            {folders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No audio folders found in AudioInject directory.
              </p>
            )}
          </CardContent>
        </Card>
        </div>
      </ComingSoonOverlay>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, AlertCircle, Trash2, FileText, Search, Download, Play, Pause } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Fm26Installation, LogInfo } from "@/types";

const STORAGE_KEY = "fm26_install_path";

export function LogsTab() {
  const [installation, setInstallation] = useState<Fm26Installation | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [logInfo, setLogInfo] = useState<LogInfo | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load installation on mount
  useEffect(() => {
    const savedPath = localStorage.getItem(STORAGE_KEY);
    if (savedPath) {
      loadInstallation(savedPath);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && installation) {
      intervalRef.current = setInterval(() => {
        loadData(installation, true);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [autoRefresh, refreshInterval, installation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadInstallation = async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const install = await invoke<Fm26Installation>("inspect_fm26_install", {
        rootPath: path,
      });
      setInstallation(install);
      await loadData(install, false);
    } catch (err) {
      setError(String(err));
      setInstallation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async (install: Fm26Installation, silent: boolean = false) => {
    try {
      const [content, info] = await Promise.all([
        invoke<string>("read_log", { install }),
        invoke<LogInfo>("get_log_info", { install }),
      ]);
      setLogContent(content);
      setLogInfo(info);
      if (!silent) {
        setError(null);
      }
    } catch (err) {
      if (!silent) {
        setError(String(err));
      }
    }
  };

  const handleRefresh = async () => {
    if (installation) {
      setIsLoading(true);
      await loadData(installation, false);
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!installation) return;

    try {
      await invoke("clear_log", { install: installation });
      setLogContent("");
      await loadData(installation);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleExport = () => {
    if (!logContent) return;

    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BepInEx_Log_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getLogLevel = (line: string): string => {
    if (line.includes("[Error") || line.includes("[Error]")) return "error";
    if (line.includes("[Warning") || line.includes("[Warning]")) return "warning";
    if (line.includes("[Info") || line.includes("[Info]")) return "info";
    if (line.includes("[Debug") || line.includes("[Debug]")) return "debug";
    if (line.includes("[Message") || line.includes("[Message]")) return "message";
    return "other";
  };

  const getFilteredLines = (): string[] => {
    let lines = logContent.split("\n");

    // Filter by level
    if (levelFilter !== "all") {
      lines = lines.filter((line) => getLogLevel(line) === levelFilter);
    }

    // Filter by text search
    if (filter.trim()) {
      const filterLower = filter.toLowerCase();
      lines = lines.filter((line) => line.toLowerCase().includes(filterLower));
    }

    return lines;
  };

  const filteredLines = getFilteredLines();

  const getLineClass = (line: string): string => {
    if (line.includes("[Error") || line.includes("[Error]")) return "text-red-500";
    if (line.includes("[Warning") || line.includes("[Warning]")) return "text-yellow-500";
    if (line.includes("[Info") || line.includes("[Info]")) return "text-blue-400";
    if (line.includes("[Debug") || line.includes("[Debug]")) return "text-gray-400";
    if (line.includes("[Message") || line.includes("[Message]")) return "text-green-400";
    return "text-muted-foreground";
  };

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>BepInEx Log</span>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    size="sm"
                    disabled={!logContent}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export log</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    size="sm"
                    disabled={!logContent}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear log</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center gap-4">
            {logInfo && (
              <>
                <Badge variant={logInfo.exists ? "outline" : "secondary"}>
                  {logInfo.exists ? formatBytes(logInfo.size_bytes) : "No log file"}
                </Badge>
                {logInfo.modified && (
                  <span className="text-xs text-muted-foreground">
                    Modified: {logInfo.modified}
                  </span>
                )}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-refresh controls */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {autoRefresh ? (
                  <Play className="h-4 w-4 text-green-500" />
                ) : (
                  <Pause className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="autoRefresh" className="text-sm">
                  Auto-refresh
                </Label>
              </div>
              <Switch
                id="autoRefresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
            {autoRefresh && (
              <div className="flex items-center gap-2">
                <Label htmlFor="interval" className="text-sm text-muted-foreground">
                  Interval:
                </Label>
                <Select
                  value={String(refreshInterval)}
                  onValueChange={(value) => setRefreshInterval(Number(value))}
                >
                  <SelectTrigger id="interval" className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1s</SelectItem>
                    <SelectItem value="2000">2s</SelectItem>
                    <SelectItem value="3000">3s</SelectItem>
                    <SelectItem value="5000">5s</SelectItem>
                    <SelectItem value="10000">10s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1"
            />
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error"><span className="text-red-500">Error</span></SelectItem>
                <SelectItem value="warning"><span className="text-yellow-500">Warning</span></SelectItem>
                <SelectItem value="info"><span className="text-blue-400">Info</span></SelectItem>
                <SelectItem value="message"><span className="text-green-400">Message</span></SelectItem>
                <SelectItem value="debug"><span className="text-gray-400">Debug</span></SelectItem>
              </SelectContent>
            </Select>
            {(filter || levelFilter !== "all") && (
              <Badge variant="secondary">
                {filteredLines.length} / {logContent.split("\n").length} lines
              </Badge>
            )}
          </div>

          <div className="border rounded-md bg-black/50">
            <ScrollArea className="h-[400px]" ref={scrollRef}>
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {logContent ? (
                  filteredLines.map((line, index) => (
                    <div key={index} className={getLineClass(line)}>
                      {line}
                    </div>
                  ))
                ) : (
                  <span className="text-muted-foreground">
                    No log content. Run the game with BepInEx to generate logs.
                  </span>
                )}
              </pre>
            </ScrollArea>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Log file location:</p>
            <p className="font-mono break-all">{installation.log_path}</p>
          </div>

          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="text-red-500">Error</Badge>
            <Badge variant="outline" className="text-yellow-500">Warning</Badge>
            <Badge variant="outline" className="text-blue-400">Info</Badge>
            <Badge variant="outline" className="text-green-400">Message</Badge>
            <Badge variant="outline" className="text-gray-400">Debug</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

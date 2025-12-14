import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { open } from "@tauri-apps/plugin-shell";
import { getVersion } from "@tauri-apps/api/app";
import { Heart } from "lucide-react";
import { MdFileDownload, MdStadium, MdAudioFile } from "react-icons/md";
import { FaCog } from "react-icons/fa";
import { IoMdDocument } from "react-icons/io";
import { GameTab } from "@/tabs/GameTab";
import { StadiumsTab } from "@/tabs/StadiumsTab";
import { AudioTab } from "@/tabs/AudioTab";
import { ConfigsTab } from "@/tabs/ConfigsTab";
import { LogsTab } from "@/tabs/LogsTab";
import { UpdateChecker } from "@/components/UpdateChecker";

function App() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Drag region for window movement */}
        <div
          data-tauri-drag-region
          className="h-8 w-full shrink-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />
        <div className="flex-1 p-6 pt-0">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold text-foreground">
              BassyStadiumTools
            </h1>
            <h4 className="mb-6 text-1xl text-muted-foreground">
              by Justin Levine (jalco) for BassyBoy
            </h4>
            <Tabs defaultValue="game" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="game" className="flex items-center gap-2">
                  <MdFileDownload className="h-4 w-4" />
                  Game
                </TabsTrigger>
                <TabsTrigger value="stadiums" className="flex items-center gap-2">
                  <MdStadium className="h-4 w-4" />
                  Stadiums
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <MdAudioFile className="h-4 w-4" />
                  Audio
                </TabsTrigger>
                <TabsTrigger value="configs" className="flex items-center gap-2">
                  <FaCog className="h-4 w-4" />
                  Configs
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <IoMdDocument className="h-4 w-4" />
                  Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="game">
                <GameTab />
              </TabsContent>

              <TabsContent value="stadiums">
                <StadiumsTab />
              </TabsContent>

              <TabsContent value="audio">
                <AudioTab />
              </TabsContent>

              <TabsContent value="configs">
                <ConfigsTab />
              </TabsContent>

              <TabsContent value="logs">
                <LogsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <footer className="border-t bg-background py-3 px-6">
          <div className="mx-auto max-w-6xl flex justify-between text-sm text-muted-foreground">
            <div>
              App made with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> by{" "}
              <a
                href="https://github.com/justinlevinedotme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
                onClick={(e) => {
                  e.preventDefault();
                  open("https://github.com/justinlevinedotme");
                }}
              >
                justinlevinedotme/notJALCO
              </a>{" "}
              for BassyBoy
            </div>
            {version && <div>v{version}</div>}
          </div>
        </footer>
        <Toaster position="bottom-right" />
        <UpdateChecker />
      </div>
    </TooltipProvider>
  );
}

export default App;

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameTab } from "@/tabs/GameTab";
import { StadiumsTab } from "@/tabs/StadiumsTab";
import { AudioTab } from "@/tabs/AudioTab";
import { ConfigsTab } from "@/tabs/ConfigsTab";
import { LogsTab } from "@/tabs/LogsTab";

function App() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground">
          BassyStadiumTools
        </h1>
        <h4 className="mb-6 text-1xl text-muted-foreground">
          by Justin Levine (jalco) for BassyBoy
        </h4>
        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="stadiums">Stadiums</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="configs">Configs</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
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
  );
}

export default App;

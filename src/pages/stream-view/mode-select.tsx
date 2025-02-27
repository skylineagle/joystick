import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useMode } from "@/hooks/use-mode";
import { cn } from "@/lib/utils";
import { Eye, Terminal, Video } from "lucide-react";

interface ModeSelectProps {
  deviceId: string;
}

export function ModeSelect({ deviceId }: ModeSelectProps) {
  const { isMobileLandscape } = useMobileLandscape();
  const { mode, setMode } = useMode(deviceId);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs sm:text-sm">Mode</Label>
      </div>
      <Tabs
        defaultValue="live"
        orientation="vertical"
        className="w-full"
        value={mode}
        onValueChange={(value) => setMode(value as "live" | "vmd" | "cmd")}
      >
        <TabsList className="flex flex-col w-full gap-1 bg-transparent">
          <TabsTrigger
            value="live"
            className={cn(
              "flex items-center gap-2 w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none",
              isMobileLandscape ? "p-1" : "p-1.5"
            )}
          >
            <Video className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs sm:text-sm">Live Stream</span>
          </TabsTrigger>
          <TabsTrigger
            value="vmd"
            className={cn(
              "flex items-center gap-2 w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none",
              isMobileLandscape ? "p-1" : "p-1.5"
            )}
          >
            <Eye className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs sm:text-sm">Motion Detection</span>
          </TabsTrigger>
          <TabsTrigger
            value="cmd"
            className={cn(
              "flex items-center gap-2 w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none",
              isMobileLandscape ? "p-1" : "p-1.5"
            )}
          >
            <Terminal className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs sm:text-sm">Command Mode</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

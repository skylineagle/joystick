import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { ModeSelect } from "@/pages/stream-view/mode-select";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { Settings, Video } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";

export const Controls = () => {
  const [mode, setMode] = useState<"live" | "vmd" | "cmd">("live");
  const [bitrate, setBitrate] = useState(2000);
  const { isMobileLandscape } = useMobileLandscape();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { device } = useParams<{ device: string }>();

  const handleBitrateChange = (value: number) => {
    setBitrate(value);
  };

  const isParamsRoute = pathname.endsWith("/params");
  const toggleView = () => {
    navigate(isParamsRoute ? `/${device}` : `/${device}/params`);
  };

  return (
    <>
      <Card
        className={cn(
          "flex flex-col",
          isMobileLandscape ? "p-2" : "p-4",
          isMobileLandscape
            ? "w-[180px] h-full"
            : "hidden md:flex min-w-[200px] gap-4"
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full",
            isMobileLandscape ? "gap-2" : "space-y-4"
          )}
        >
          <ModeSelect mode={mode} setMode={setMode} />
          <BitrateControll
            bitrate={bitrate}
            handleBitrateChange={handleBitrateChange}
          />
          <div className="flex-1">
            <RoiModeControl />
          </div>
          <div className="flex-1" />

          <div className="flex items-center justify-between mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:bg-transparent active:bg-transparent"
                  variant="ghost"
                  size="icon"
                  onClick={toggleView}
                >
                  {isParamsRoute ? (
                    <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isParamsRoute ? "Open stream view" : "Open params"}
              </TooltipContent>
            </Tooltip>
            <AnimatedThemeToggle />
          </div>
        </div>
      </Card>

      {/* Mobile Portrait Controls */}
      {!isMobileLandscape && (
        <div className="md:hidden">
          <Card className="p-4">
            <div className="space-y-4">
              <ModeSelect mode={mode} setMode={setMode} />
              <Separator className="my-4" />
              <RoiModeControl />
              <Separator className="my-4" />
              <BitrateControll
                bitrate={bitrate}
                handleBitrateChange={handleBitrateChange}
              />
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:bg-transparent active:bg-transparent"
                      variant="ghost"
                      size="icon"
                      onClick={toggleView}
                    >
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open settings</TooltipContent>
                </Tooltip>
                <AnimatedThemeToggle />
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

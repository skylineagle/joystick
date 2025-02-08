import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useRoiMode } from "@/hooks/use-roi-mode";
import { cn } from "@/lib/utils";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { ModeSelect } from "@/pages/stream-view/mode-select";
import { Roi } from "@/pages/stream-view/roi/roi";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { Settings } from "lucide-react";
import { useState } from "react";
import { CommittedRoiProperties, RoiProvider } from "react-roi";
import { useNavigate } from "react-router-dom";
import { Frame } from "./frame";

export function StreamView() {
  const [mode, setMode] = useState<"live" | "vmd" | "cmd">("live");
  const [bitrate, setBitrate] = useState(2000);
  const { roiMode } = useRoiMode();
  const [roiData, setRoiData] = useState<CommittedRoiProperties<unknown>[]>([]);
  const { isMobileLandscape } = useMobileLandscape();
  const navigate = useNavigate();

  const handleBitrateChange = (value: number) => {
    setBitrate(value);
  };

  return (
    <RoiProvider
      initialConfig={{
        commitRoiBoxStrategy: "exact",
        resizeStrategy: "none",
        rois: roiData,
        mode: roiMode === "edit" ? "hybrid" : "select",
      }}
      onAfterDraw={(roi) => {
        setRoiData((prev) => [...prev, roi]);
      }}
      onAfterMove={(selectedRoiId, roi) => {
        setRoiData((prev) =>
          prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
        );
      }}
      onAfterResize={(selectedRoiId, roi) => {
        setRoiData((prev) =>
          prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
        );
      }}
      onAfterRotate={(selectedRoiId, roi) => {
        setRoiData((prev) =>
          prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
        );
      }}
    >
      <div className={cn("inset-0 h-full", isMobileLandscape && "h-[100dvh]")}>
        <div
          className={cn(
            "flex items-start justify-center h-full",
            isMobileLandscape ? "p-1" : "p-2 sm:p-4"
          )}
        >
          <div
            className={cn(
              "flex gap-2",
              isMobileLandscape
                ? "flex-row"
                : "flex-col md:flex-row gap-4 md:gap-6 w-full max-w-[1200px]"
            )}
          >
            {roiMode === "hide" ? <Frame mode="view" /> : <Roi />}

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
                <Separator
                  className={cn("my-2", isMobileLandscape ? "my-1" : "my-4")}
                />
                <RoiModeControl />
                <Separator
                  className={cn("my-2", isMobileLandscape ? "my-1" : "my-4")}
                />
                <BitrateControll
                  bitrate={bitrate}
                  handleBitrateChange={handleBitrateChange}
                />
                <div className="flex-1" />

                <div className="flex items-center justify-between mt-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="hover:bg-transparent active:bg-transparent"
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/params")}
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
                            onClick={() => navigate("/params")}
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
          </div>
        </div>
      </div>
    </RoiProvider>
  );
}

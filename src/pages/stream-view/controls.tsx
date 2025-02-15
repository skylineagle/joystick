import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { Icon } from "@/icons/icon";
import settings from "@/icons/settings.json";
import video from "@/icons/video.json";
import { cn } from "@/lib/utils";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { ModeSelect } from "@/pages/stream-view/mode-select";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const Controls = () => {
  const [mode, setMode] = useState<"live" | "vmd" | "cmd">("live");
  const { isMobileLandscape } = useMobileLandscape();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { device } = useParams<{ device: string }>();
  const isRoiSupported = useIsSupported(device!, "set-roi");
  const isSetBitrateSupported = useIsSupported(device!, [
    "set-bitrate",
    "get-bitrate",
  ]);

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
          {isSetBitrateSupported && <BitrateControll deviceId={device!} />}
          <div className="flex-1">{isRoiSupported && <RoiModeControl />}</div>
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
                    <Icon icon={video} style={{ width: 24, height: 24 }} />
                  ) : (
                    <Icon icon={settings} style={{ width: 24, height: 24 }} />
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
              {isSetBitrateSupported && <BitrateControll deviceId={device!} />}
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:bg-transparent active:bg-transparent"
                      variant="ghost"
                      size="icon"
                      onClick={toggleView}
                    >
                      <Icon icon={settings} style={{ width: 24, height: 24 }} />
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

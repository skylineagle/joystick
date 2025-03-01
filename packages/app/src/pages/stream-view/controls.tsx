import { ModeSelector } from "@/components/device/mode-selector";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";

import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { useParams } from "react-router-dom";

export const Controls = () => {
  const { isMobileLandscape } = useMobileLandscape();
  const { device } = useParams<{ device: string }>();
  const { isSupported: isRoiSupported, isLoading: isRoiLoading } =
    useIsSupported(device!, ["set-roi", "get-roi"]);
  const { isSupported: isSetBitrateSupported, isLoading: isSetBitrateLoading } =
    useIsSupported(device!, ["set-bitrate", "get-bitrate"]);
  const { isSupported: isSetModeSupported, isLoading: isSetModeLoading } =
    useIsSupported(device!, ["set-mode", "get-mode"]);

  return (
    <Card
      className={cn(
        "flex flex-col",
        isMobileLandscape
          ? "p-2 w-[180px] h-full"
          : "p-4 hidden md:flex min-w-[200px] gap-4"
      )}
    >
      <div
        className={cn(
          "flex flex-col h-full",
          isMobileLandscape ? "gap-2" : "space-y-4"
        )}
      >
        {isSetModeSupported && !isSetModeLoading && (
          <ModeSelector deviceId={device!} />
        )}

        {isSetBitrateSupported && !isSetBitrateLoading && (
          <>
            <Separator className="my-2" />
            <BitrateControll deviceId={device!} />
          </>
        )}

        {isRoiSupported && !isRoiLoading && (
          <>
            <Separator className="my-2" />
            <RoiModeControl />
          </>
        )}

        <div className="flex-1" />
      </div>
    </Card>
  );
};

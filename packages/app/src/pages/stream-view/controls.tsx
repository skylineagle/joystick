import { ModeSelector } from "@/components/device/mode-selector";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { CellularStatus } from "@/pages/status/cellular-status";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";

import { StatusIndicator } from "@/components/device/status-indicator";
import { useDevice } from "@/hooks/use-device";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { useParams } from "react-router-dom";

export const Controls = () => {
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams<{ device: string }>();
  const { data: device, isLoading: isDeviceLoading } = useDevice(deviceId!);
  const { isSupported: isRoiSupported, isLoading: isRoiLoading } =
    useIsSupported(deviceId!, ["set-roi", "get-roi"]);
  const { isSupported: isSetBitrateSupported, isLoading: isSetBitrateLoading } =
    useIsSupported(deviceId!, ["set-bitrate", "get-bitrate"]);
  const { isSupported: isSetModeSupported, isLoading: isSetModeLoading } =
    useIsSupported(deviceId!, ["set-mode", "get-mode"]);
  const { isSupported: isGetCpsiSupported, isLoading: isGetCpsiLoading } =
    useIsSupported(deviceId!, "get-cpsi");

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
        {isSetModeSupported && !isSetModeLoading && !isDeviceLoading && (
          <div className="flex items-center gap-4">
            <ModeSelector deviceId={deviceId!} />
            <div className="self-center">
              <StatusIndicator status={device?.status ?? "unknown"} />{" "}
            </div>
          </div>
        )}

        {isSetBitrateSupported && !isSetBitrateLoading && (
          <>
            <Separator className="my-2" />
            <BitrateControll deviceId={deviceId!} />
          </>
        )}

        {isRoiSupported && !isRoiLoading && (
          <>
            <Separator className="my-2" />
            <RoiModeControl />
          </>
        )}

        {isGetCpsiSupported && !isGetCpsiLoading && (
          <CellularStatus
            deviceId={deviceId!}
            className="border-none m-0 p-0"
          />
        )}

        <div className="flex-1" />
      </div>
    </Card>
  );
};

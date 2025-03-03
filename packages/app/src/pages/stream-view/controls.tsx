import { ModeSelector } from "@/components/device/mode-selector";
import { StatusIndicator } from "@/components/device/status-indicator";
import { MediaMtxMonitor } from "@/components/stream/media-mtx-monitor";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevice } from "@/hooks/use-device";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { CellularStatus } from "@/pages/status/cellular-status";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { BarChart, Cpu, Signal } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

type TabValue = "stream" | "device" | "cell";

export const Controls = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("stream");
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams<{ device: string }>();
  const { data: device, isLoading: isDeviceLoading } = useDevice(deviceId!);
  const { isSupported: isRoiSupported, isLoading: isRoiLoading } =
    useIsSupported(deviceId!, ["set-roi", "get-roi"]);
  const { isSupported: isSetBitrateSupported, isLoading: isSetBitrateLoading } =
    useIsSupported(deviceId!, ["set-bitrate", "get-bitrate"]);
  const { isSupported: isSetModeSupported, isLoading: isSetModeLoading } =
    useIsSupported(deviceId!, ["set-mode", "get-mode"]);

  const isMediaMtx = device?.expand?.device.stream === "mediamtx";

  return (
    <Card
      className={cn(
        "flex flex-col border-none bg-muted/30",
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

        <Card className="p-3 border-t mt-3">
          <Tabs
            defaultValue="stream"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            {isMediaMtx && (
              <TabsContent value="stream" className="m-0 pt-2">
                {device?.configuration?.name && (
                  <MediaMtxMonitor deviceName={device.configuration.name} />
                )}
              </TabsContent>
            )}

            <TabsContent value="device" className="m-0 pt-2">
              {/* {renderDeviceStatus()} */}
            </TabsContent>

            <TabsContent value="cell" className="m-0 pt-2">
              <CellularStatus deviceId={deviceId!} />
            </TabsContent>

            <TabsList className="grid grid-cols-3 mt-2 h-7">
              {isMediaMtx && (
                <TabsTrigger value="stream" className="text-xs py-0.5 px-1">
                  <BarChart className="h-3 w-3 mr-1" />
                  Stream
                </TabsTrigger>
              )}
              <TabsTrigger value="device" className="text-xs py-0.5 px-1">
                <Cpu className="h-3 w-3 mr-1" />
                Device
              </TabsTrigger>
              <TabsTrigger value="cell" className="text-xs py-0.5 px-1">
                <Signal className="h-3 w-3 mr-1" />
                Cell
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <div className="flex-1" />
      </div>
    </Card>
  );
};

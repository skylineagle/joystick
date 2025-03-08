import { AutomateToggle } from "@/components/device/automate-toggle";
import { ModeSelector } from "@/components/device/mode-selector";
import { StatusIndicator } from "@/components/device/status-indicator";
import { MediaMtxMonitor } from "@/components/stream/media-mtx-monitor";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevice } from "@/hooks/use-device";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { CellularStatus } from "@/pages/status/cellular-status";
import { ServicesStatus } from "@/pages/status/services-status";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { BarChart, Cpu, Signal } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { DevicesStatusOptions } from "@/types/db.types";
import { AutomationIndicator } from "@/components/device/automation-indicator";

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
    useIsSupported(deviceId!, "set-mode");
  const {
    isSupported: isGetServicesStatusSupported,
    isLoading: isGetServicesStatusLoading,
  } = useIsSupported(deviceId!, ["get-services-status"]);
  const {
    isSupported: isGetCpsiStatusSupported,
    isLoading: isGetCpsiStatusLoading,
  } = useIsSupported(deviceId!, ["get-cpsi"]);

  const isMediaMtx = device?.expand?.device.stream === "mediamtx";

  return (
    <Card
      className={cn(
        "flex flex-col border-none shadow-2xl bg-muted/30",
        isMobileLandscape
          ? "p-2 w-[180px] h-full"
          : "p-4 hidden md:flex w-[320px] gap-4"
      )}
    >
      <div className="flex flex-col h-full gap-2">
        {/* Mode Selector Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {isSetModeLoading || isDeviceLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-40 h-10" />
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
            ) : isSetModeSupported ? (
              <>
                <ModeSelector deviceId={deviceId!} />
                <div className="self-center">
                  <StatusIndicator status={device?.status ?? "unknown"} />
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Automation Section */}
        <div className="flex flex-col gap-2">
          {device?.automation ? (
            <>
              <Separator className="my-2" />
              {isDeviceLoading ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 grid-rows-1 items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 grid-rows-1 items-center gap-2">
                    <Label className="text-muted-foreground">Auto mode:</Label>
                    <AutomateToggle
                      deviceId={deviceId!}
                      isAutomated={device?.auto ?? false}
                    />
                  </div>
                  {device.auto && <AutomationIndicator device={device} />}
                </>
              )}
            </>
          ) : null}
        </div>

        {/* Bitrate Control Section */}
        <div>
          {isSetBitrateSupported ? (
            <>
              <Separator className="my-2" />
              {isSetBitrateLoading ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <BitrateControll deviceId={deviceId!} />
              )}
            </>
          ) : null}
        </div>

        {/* ROI Control Section */}
        <div>
          {isRoiSupported ? (
            <>
              <Separator className="my-2" />
              {isRoiLoading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <RoiModeControl />
              )}
            </>
          ) : null}
        </div>

        <div className="flex-1" />

        {/* Tabs Section - Always at the bottom */}
        <Card className="p-3 border-none shadow-xl">
          <Tabs
            defaultValue="stream"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="w-full"
          >
            {/* Tab Content */}
            {isMediaMtx && (
              <TabsContent value="stream" className="m-0 pt-2">
                {device?.configuration?.name &&
                  device.status !== DevicesStatusOptions.off && (
                    <MediaMtxMonitor deviceName={device.configuration.name} />
                  )}
              </TabsContent>
            )}

            {isGetServicesStatusSupported && !isGetServicesStatusLoading && (
              <TabsContent value="device" className="m-0 pt-2">
                <ServicesStatus deviceId={deviceId!} />
              </TabsContent>
            )}

            {isGetCpsiStatusSupported && !isGetCpsiStatusLoading && (
              <TabsContent value="cell" className="m-0 pt-2">
                <CellularStatus deviceId={deviceId!} />
              </TabsContent>
            )}

            {/* Tab Triggers */}
            <TabsList
              className={`grid grid-cols-${
                (isMediaMtx ? 1 : 0) +
                (isGetServicesStatusSupported ? 1 : 0) +
                (isGetCpsiStatusSupported ? 1 : 0)
              } mt-2 h-7`}
            >
              {isMediaMtx && (
                <TabsTrigger value="stream" className="text-xs py-0.5 px-1">
                  <BarChart className="h-3 w-3 mr-1" />
                  Stream
                </TabsTrigger>
              )}
              {isGetServicesStatusSupported && !isGetServicesStatusLoading && (
                <TabsTrigger value="device" className="text-xs py-0.5 px-1">
                  <Cpu className="h-3 w-3 mr-1" />
                  Device
                </TabsTrigger>
              )}
              {isGetCpsiStatusSupported && !isGetCpsiStatusLoading && (
                <TabsTrigger value="cell" className="text-xs py-0.5 px-1">
                  <Signal className="h-3 w-3 mr-1" />
                  Cell
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </Card>
      </div>
    </Card>
  );
};

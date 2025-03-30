import { AutomateToggle } from "@/components/device/automate-toggle";
import { AutomationIndicator } from "@/components/device/automation-indicator";
import { ModeSelector } from "@/components/device/mode-selector";
import { StatusIndicator } from "@/components/device/status-indicator";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevice } from "@/hooks/use-device";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { BatteryStatus } from "@/pages/status/battery-status";
import { CellularStatus } from "@/pages/status/cellular-status";
import { GPSStatus } from "@/pages/status/gps-status";
import { IMUStatus } from "@/pages/status/imu-status";
import { ServicesStatus } from "@/pages/status/services-status";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { AnimatePresence, motion } from "framer-motion";
import { Battery, Cpu, Map, Navigation, Signal } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useParams } from "react-router";

type TabValue = "device" | "cell" | "battery" | "imu" | "gps";

const MotionCard = motion(Card);
const MotionTabsContent = motion(TabsContent);
const MotionTabsTrigger = motion(TabsTrigger);

export const Controls = () => {
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams<{ device: string }>();
  const { data: device, isLoading: isDeviceLoading } = useDevice(deviceId!);
  const { isSupported: isRoiSupported, isLoading: isRoiLoading } =
    useIsSupported(deviceId!, ["get-roi"]);
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
  const { isSupported: isGetBatterySupported, isLoading: isGetBatteryLoading } =
    useIsSupported(deviceId!, ["get-battery"]);
  const { isSupported: isGetImuSupported, isLoading: isGetImuLoading } =
    useIsSupported(deviceId!, ["get-imu"]);
  const { isSupported: isGetGpsSupported, isLoading: isGetGpsLoading } =
    useIsSupported(deviceId!, ["get-gps"]);
  const [activeTab, setActiveTab] = useQueryState(
    "activeTab",
    parseAsStringEnum(["device", "cell", "battery", "imu", "gps"])
      .withDefault(
        isGetServicesStatusSupported
          ? "device"
          : isGetCpsiStatusSupported
          ? "cell"
          : isGetBatterySupported
          ? "battery"
          : isGetImuSupported
          ? "imu"
          : isGetGpsSupported
          ? "gps"
          : "device"
      )
      .withOptions({
        shallow: true,
      })
  );

  return (
    <MotionCard
      className={cn(
        "flex flex-col border-none shadow-2xl bg-muted/30",
        isMobileLandscape
          ? "p-2 w-[180px] h-full"
          : "p-4 hidden md:flex w-[320px] gap-4"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col h-full gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Mode Selector Section */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        >
          <div className="flex items-center gap-4">
            {isSetModeLoading || isDeviceLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-40 h-10" />
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
            ) : isSetModeSupported ? (
              <>
                {device && <ModeSelector device={device} />}
                <div className="self-center">
                  <StatusIndicator status={device?.status ?? "unknown"} />
                </div>
              </>
            ) : null}
          </div>
        </motion.div>

        {/* Automation Section */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.2 }}
        >
          {device?.automation ? (
            <>
              {isDeviceLoading ? (
                <div className="mt-2">
                  <div className="grid grid-cols-2 grid-rows-1 items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 grid-rows-1 items-center gap-2 mt-2">
                    <Label className="text-muted-foreground">Auto mode:</Label>
                    <AutomateToggle
                      deviceId={deviceId!}
                      isAutomated={device?.auto ?? false}
                    />
                  </div>
                  {device?.auto && (
                    <AutomationIndicator
                      deviceId={deviceId!}
                      automation={device?.automation}
                      status={device?.status}
                    />
                  )}
                </>
              )}
            </>
          ) : null}
        </motion.div>

        {/* Bitrate Control Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.2 }}
        >
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
        </motion.div>

        {/* ROI Control Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.2 }}
        >
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
                <RoiModeControl deviceId={deviceId!} />
              )}
            </>
          ) : null}
        </motion.div>

        <div className="flex-1" />

        {/* Tabs Section - Always at the bottom */}
        <MotionCard
          className="p-3 border-none shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <Tabs
            defaultValue="device"
            value={activeTab ?? "device"}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="w-full"
          >
            {isGetServicesStatusSupported && !isGetServicesStatusLoading && (
              <MotionTabsContent
                value="device"
                className="m-0 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ServicesStatus deviceId={deviceId!} />
              </MotionTabsContent>
            )}

            {isGetCpsiStatusSupported && !isGetCpsiStatusLoading && (
              <MotionTabsContent
                value="cell"
                className="m-0 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <CellularStatus deviceId={deviceId!} />
              </MotionTabsContent>
            )}

            {isGetBatterySupported && !isGetBatteryLoading && (
              <MotionTabsContent
                value="battery"
                className="m-0 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <BatteryStatus deviceId={deviceId!} />
              </MotionTabsContent>
            )}

            {isGetImuSupported && !isGetImuLoading && (
              <MotionTabsContent
                value="imu"
                className="m-0 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <IMUStatus deviceId={deviceId!} />
              </MotionTabsContent>
            )}

            {isGetGpsSupported && !isGetGpsLoading && (
              <MotionTabsContent
                value="gps"
                className="m-0 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <GPSStatus deviceId={deviceId!} />
              </MotionTabsContent>
            )}

            {/* Tab Triggers */}
            <TabsList
              className={cn("mt-2 h-7 grid", {
                "grid-cols-5":
                  [
                    isGetServicesStatusSupported,
                    isGetCpsiStatusSupported,
                    isGetBatterySupported,
                    isGetImuSupported,
                    isGetGpsSupported,
                  ].filter(Boolean).length >= 5,
                "grid-cols-4":
                  [
                    isGetServicesStatusSupported,
                    isGetCpsiStatusSupported,
                    isGetBatterySupported,
                    isGetImuSupported,
                    isGetGpsSupported,
                  ].filter(Boolean).length === 4,
                "grid-cols-3":
                  [
                    isGetServicesStatusSupported,
                    isGetCpsiStatusSupported,
                    isGetBatterySupported,
                    isGetImuSupported,
                    isGetGpsSupported,
                  ].filter(Boolean).length === 3,
                "grid-cols-2":
                  [
                    isGetServicesStatusSupported,
                    isGetCpsiStatusSupported,
                    isGetBatterySupported,
                    isGetImuSupported,
                    isGetGpsSupported,
                  ].filter(Boolean).length === 2,
                "grid-cols-1":
                  [
                    isGetServicesStatusSupported,
                    isGetCpsiStatusSupported,
                    isGetBatterySupported,
                    isGetImuSupported,
                    isGetGpsSupported,
                  ].filter(Boolean).length === 1,
              })}
            >
              {isGetServicesStatusSupported && !isGetServicesStatusLoading && (
                <MotionTabsTrigger
                  value="device"
                  className="text-xs py-0.5 px-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={
                    activeTab !== "device" ? { opacity: 0.7 } : { opacity: 1 }
                  }
                  animate={
                    activeTab === "device"
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0.7, scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                >
                  <Cpu className="h-3 w-3 mr-1" />
                  <AnimatePresence mode="wait">
                    {activeTab === "device" && (
                      <motion.span
                        key="device-text"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Device
                      </motion.span>
                    )}
                  </AnimatePresence>
                </MotionTabsTrigger>
              )}
              {isGetCpsiStatusSupported && !isGetCpsiStatusLoading && (
                <MotionTabsTrigger
                  value="cell"
                  className="text-xs py-0.5 px-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={
                    activeTab !== "cell" ? { opacity: 0.7 } : { opacity: 1 }
                  }
                  animate={
                    activeTab === "cell"
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0.7, scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                >
                  <Signal className="h-3 w-3 mr-1" />
                  <AnimatePresence mode="wait">
                    {activeTab === "cell" && (
                      <motion.span
                        key="cell-text"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Cell
                      </motion.span>
                    )}
                  </AnimatePresence>
                </MotionTabsTrigger>
              )}
              {isGetBatterySupported && !isGetBatteryLoading && (
                <MotionTabsTrigger
                  value="battery"
                  className="text-xs py-0.5 px-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={
                    activeTab !== "battery" ? { opacity: 0.7 } : { opacity: 1 }
                  }
                  animate={
                    activeTab === "battery"
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0.7, scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                >
                  <Battery className="h-3 w-3 mr-1" />
                  <AnimatePresence mode="wait">
                    {activeTab === "battery" && (
                      <motion.span
                        key="battery-text"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Battery
                      </motion.span>
                    )}
                  </AnimatePresence>
                </MotionTabsTrigger>
              )}
              {isGetImuSupported && !isGetImuLoading && (
                <MotionTabsTrigger
                  value="imu"
                  className="text-xs py-0.5 px-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={
                    activeTab !== "imu" ? { opacity: 0.7 } : { opacity: 1 }
                  }
                  animate={
                    activeTab === "imu"
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0.7, scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  <AnimatePresence mode="wait">
                    {activeTab === "imu" && (
                      <motion.span
                        key="imu-text"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        IMU
                      </motion.span>
                    )}
                  </AnimatePresence>
                </MotionTabsTrigger>
              )}
              {isGetGpsSupported && !isGetGpsLoading && (
                <MotionTabsTrigger
                  value="gps"
                  className="text-xs py-0.5 px-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={
                    activeTab !== "gps" ? { opacity: 0.7 } : { opacity: 1 }
                  }
                  animate={
                    activeTab === "gps"
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0.7, scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                >
                  <Map className="h-3 w-3 mr-1" />
                  <AnimatePresence mode="wait">
                    {activeTab === "gps" && (
                      <motion.span
                        key="gps-text"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        GPS
                      </motion.span>
                    )}
                  </AnimatePresence>
                </MotionTabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </MotionCard>
      </motion.div>
    </MotionCard>
  );
};

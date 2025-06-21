import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import { cn } from "@/lib/utils";
import { BatteryStatus } from "@/pages/status/battery-status";
import { CellularStatus } from "@/pages/status/cellular-status";
import { GPSStatus } from "@/pages/status/gps-status";
import { IMUStatus } from "@/pages/status/imu-status";
import { PtzControl } from "@/pages/stream-view/ptz-control";
import { TerminalPingControl } from "@/pages/stream-view/terminal-ping-control";
import { AnimatePresence, motion } from "framer-motion";
import { Battery, Map, Move, Navigation, Signal, Terminal } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { FC } from "react";

export interface DeviceInfoProps {
  deviceId: string;
}

type TabValue = "cell" | "battery" | "imu" | "gps" | "ping" | "ptz";

const MotionCard = motion.create(Card);
const MotionTabsContent = motion.create(TabsContent);
const MotionTabsTrigger = motion.create(TabsTrigger);

export const DeviceInfo: FC<DeviceInfoProps> = ({ deviceId }) => {
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
  const { isSupported: isPtzXSupported, isLoading: isPtzXLoading } =
    useIsSupported(deviceId!, ["set-x", "get-x"]);
  const { isSupported: isPtzYSupported, isLoading: isPtzYLoading } =
    useIsSupported(deviceId!, ["set-y", "get-y"]);
  const isPtzSupported = isPtzXSupported || isPtzYSupported;
  const isPtzLoading = isPtzXLoading || isPtzYLoading;
  const isGpsPermitted = useIsPermitted("device-gps");
  const isImuPermitted = useIsPermitted("device-imu");
  const isBatteryPermitted = useIsPermitted("device-battery");
  const isCpsiPermitted = useIsPermitted("device-cpsi");
  const isPingPermitted = useIsPermitted("device-ping");
  const isPtzPermitted = useIsPermitted("control-ptz");

  const isGps = isGpsPermitted && isGetGpsSupported;
  const isImu = isImuPermitted && isGetImuSupported;
  const isBattery = isBatteryPermitted && isGetBatterySupported;
  const isCpsi = isCpsiPermitted && isGetCpsiStatusSupported;
  const isPing = isPingPermitted;
  const isPtz = isPtzPermitted && isPtzSupported;

  const [activeTab, setActiveTab] = useQueryState(
    "activeTab",
    parseAsStringEnum(["cell", "battery", "imu", "gps", "ping", "ptz"])
      .withDefault(
        isGetCpsiStatusSupported
          ? "cell"
          : isGetBatterySupported
          ? "battery"
          : isGetImuSupported
          ? "imu"
          : isGetGpsSupported
          ? "gps"
          : isPtzSupported
          ? "ptz"
          : isPingPermitted
          ? "ping"
          : "cell"
      )
      .withOptions({
        shallow: true,
      })
  );

  const availableTabs = [isCpsi, isBattery, isImu, isGps, isPtz, isPing].filter(
    Boolean
  ).length;

  return (
    (isGps || isImu || isBattery || isCpsi || isPtz || isPing) && (
      <Tabs
        defaultValue="device"
        value={activeTab ?? "device"}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="w-full"
      >
        <MotionCard
          className="p-3 border-none shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          {isCpsi && !isGetCpsiStatusLoading && (
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

          {isBattery && !isGetBatteryLoading && (
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

          {isImu && !isGetImuLoading && (
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

          {isGps && !isGetGpsLoading && (
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

          {isPtz && !isPtzLoading && (
            <MotionTabsContent
              value="ptz"
              className="m-0 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <PtzControl deviceId={deviceId!} />
            </MotionTabsContent>
          )}

          {isPing && (
            <MotionTabsContent
              value="ping"
              className="m-0 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TerminalPingControl
                deviceId={deviceId!}
                tabActive={activeTab === "ping"}
              />
            </MotionTabsContent>
          )}
        </MotionCard>
        {/* Tab Triggers */}
        <TabsList
          className={cn("shadow-xl mt-2 h-7 grid", {
            "grid-cols-6": availableTabs === 6,
            "grid-cols-5": availableTabs === 5,
            "grid-cols-4": availableTabs === 4,
            "grid-cols-3": availableTabs === 3,
            "grid-cols-2": availableTabs === 2,
            "grid-cols-1": availableTabs === 1,
          })}
        >
          {isCpsi && !isGetCpsiStatusLoading && (
            <MotionTabsTrigger
              value="cell"
              className="text-xs py-0.5 px-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={activeTab !== "cell" ? { opacity: 0.7 } : { opacity: 1 }}
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
          {isBattery && !isGetBatteryLoading && (
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
          {isImu && !isGetImuLoading && (
            <MotionTabsTrigger
              value="imu"
              className="text-xs py-0.5 px-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={activeTab !== "imu" ? { opacity: 0.7 } : { opacity: 1 }}
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
          {isGps && !isGetGpsLoading && (
            <MotionTabsTrigger
              value="gps"
              className="text-xs py-0.5 px-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={activeTab !== "gps" ? { opacity: 0.7 } : { opacity: 1 }}
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
          {isPtz && !isPtzLoading && (
            <MotionTabsTrigger
              value="ptz"
              className="text-xs py-0.5 px-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={activeTab !== "ptz" ? { opacity: 0.7 } : { opacity: 1 }}
              animate={
                activeTab === "ptz"
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0.7, scale: 1 }
              }
              transition={{ duration: 0.2 }}
            >
              <Move className="h-3 w-3 mr-1" />
              <AnimatePresence mode="wait">
                {activeTab === "ptz" && (
                  <motion.span
                    key="ptz-text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    PTZ
                  </motion.span>
                )}
              </AnimatePresence>
            </MotionTabsTrigger>
          )}
          {isPing && (
            <MotionTabsTrigger
              value="ping"
              className="text-xs py-0.5 px-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={activeTab !== "ping" ? { opacity: 0.7 } : { opacity: 1 }}
              animate={
                activeTab === "ping"
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0.7, scale: 1 }
              }
              transition={{ duration: 0.2 }}
            >
              <Terminal className="h-3 w-3 mr-1" />
              <AnimatePresence mode="wait">
                {activeTab === "ping" && (
                  <motion.span
                    key="ping-text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Ping
                  </motion.span>
                )}
              </AnimatePresence>
            </MotionTabsTrigger>
          )}
        </TabsList>
      </Tabs>
    )
  );
};

import { AutomateToggle } from "@/components/device/automate-toggle";
import { AutomationIndicator } from "@/components/device/automation-indicator";
import { ModeSelector } from "@/components/device/mode-selector";
import { OverlayToggle } from "@/components/device/overlay-toggle";
import { StatusIndicator } from "@/components/device/status-indicator";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevice } from "@/hooks/use-device";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { DeviceInfo } from "@/pages/stream-view/device-info";
import { FpsControll } from "@/pages/stream-view/fps-control";
import { QualityControll } from "@/pages/stream-view/quality-control";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { motion } from "framer-motion";
import { useLocation, useParams } from "react-router";

const MotionCard = motion(Card);

export const Controls = () => {
  const { isMobileLandscape } = useMobileLandscape();
  const { pathname } = useLocation();
  const { device: deviceId } = useParams<{ device: string }>();
  const { data: device, isLoading: isDeviceLoading } = useDevice(deviceId!);
  const { isSupported: isRoiSupported, isLoading: isRoiLoading } =
    useIsSupported(deviceId!, ["get-roi"]);
  const isControlRoiPermitted = useIsPermitted("control-roi");
  const { isSupported: isSetBitrateSupported, isLoading: isSetBitrateLoading } =
    useIsSupported(deviceId!, ["set-bitrate", "get-bitrate"]);
  const { isSupported: isSetFpsSupported, isLoading: isSetFpsLoading } =
    useIsSupported(deviceId!, ["set-fps", "get-fps"]);
  const { isSupported: isSetQualitySupported, isLoading: isSetQualityLoading } =
    useIsSupported(deviceId!, ["set-quality", "get-quality"]);
  const { isSupported: isSetModeSupported, isLoading: isSetModeLoading } =
    useIsSupported(deviceId!, "set-mode");

  const isAdvancedStreamControlPermitted = useIsPermitted(
    "advanced-stream-control"
  );

  return (
    <MotionCard
      className={cn(
        "flex flex-col border-none shadow-2xl bg-muted/30",
        isMobileLandscape
          ? "p-4 w-[280px] h-full"
          : "p-4 hidden md:flex w-[300px] gap-4"
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
          className="flex flex-col gap-2 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        >
          <div className="flex items-center justify-between w-full space-x-2 overflow-hidden">
            {isSetModeLoading || isDeviceLoading ? (
              <div className="flex items-center justify-between w-full">
                <Skeleton className="w-36 h-10" />
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
            ) : isSetModeSupported ? (
              <>
                <div className="flex-shrink min-w-0 max-w-[210px]">
                  {device && <ModeSelector device={device} />}
                </div>
                <div className="flex-shrink-0">
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
          transition={{ delay: 0.5, duration: 0.2 }}
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

        {/* Overlay Toggle Section */}
        {device?.overlay && pathname.includes("stream") && (
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.2 }}
          >
            <Separator className="my-1" />
            {device && <OverlayToggle deviceId={deviceId!} />}
          </motion.div>
        )}

        {isAdvancedStreamControlPermitted ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.2 }}
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.2 }}
            >
              {isSetFpsSupported ? (
                <>
                  <Separator className="my-2" />
                  {isSetFpsLoading ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <FpsControll deviceId={deviceId!} />
                  )}
                </>
              ) : null}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.2 }}
          >
            {isSetQualitySupported ? (
              <>
                <Separator className="my-2" />
                {isSetQualityLoading ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <QualityControll deviceId={deviceId!} />
                )}
              </>
            ) : null}
          </motion.div>
        )}

        {/* ROI Control Section */}
        {isControlRoiPermitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.2 }}
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
        )}

        <div className="flex-1" />

        <DeviceInfo deviceId={deviceId!} />
      </motion.div>
    </MotionCard>
  );
};

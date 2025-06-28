import { Card } from "@/components/ui/card";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { DeviceInfo } from "@/pages/stream-view/device-info";
import { Wifi } from "lucide-react";
import { motion } from "motion/react";
import { useParams } from "react-router";

const MotionCard = motion.create(Card);

export const CellSearchControls = () => {
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams<{ device: string }>();

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.2 }}
          className="space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Signal Strength (RSRP)</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 items-end">
                    <div className="w-0.5 h-1.5 bg-green-500 rounded-sm" />
                    <div className="w-0.5 h-2 bg-green-500 rounded-sm" />
                    <div className="w-0.5 h-2.5 bg-green-500 rounded-sm" />
                    <div className="w-0.5 h-3 bg-green-500 rounded-sm" />
                  </div>
                  <span>Excellent</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  ≥ -80 dBm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 items-end">
                    <div className="w-0.5 h-1.5 bg-yellow-500 rounded-sm" />
                    <div className="w-0.5 h-2 bg-yellow-500 rounded-sm" />
                    <div className="w-0.5 h-2.5 bg-yellow-500 rounded-sm" />
                    <div className="w-0.5 h-3 bg-gray-300 rounded-sm" />
                  </div>
                  <span>Good</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  -80 to -90 dBm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 items-end">
                    <div className="w-0.5 h-1.5 bg-orange-500 rounded-sm" />
                    <div className="w-0.5 h-2 bg-orange-500 rounded-sm" />
                    <div className="w-0.5 h-2.5 bg-gray-300 rounded-sm" />
                    <div className="w-0.5 h-3 bg-gray-300 rounded-sm" />
                  </div>
                  <span>Fair to poor</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  -90 to -100 dBm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 items-end">
                    <div className="w-0.5 h-1.5 bg-red-500 rounded-sm" />
                    <div className="w-0.5 h-2.5 bg-gray-300 rounded-sm" />
                    <div className="w-0.5 h-2 bg-gray-300 rounded-sm" />
                    <div className="w-0.5 h-3 bg-gray-300 rounded-sm" />
                  </div>
                  <span>No signal</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  ≤ -100 dBm
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Signal Quality (RSRQ)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Excellent</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  ≥ -10 dB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Good</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  -10 to -15 dB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>Fair to poor</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  -15 to -20 dB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>No signal</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  ≤ -20 dB
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex-1" />

        <DeviceInfo deviceId={deviceId!} />
      </motion.div>
    </MotionCard>
  );
};

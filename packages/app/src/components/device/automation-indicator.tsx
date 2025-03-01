import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { urls } from "@/lib/urls";
import { DeviceResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import Countdown from "react-countdown";

type CountdownData = {
  countdownTime: number;
  until: "on" | "off";
};

interface AutomationIndicatorProps {
  device: DeviceResponse;
}

export function AutomationIndicator({ device }: AutomationIndicatorProps) {
  const { data } = useQuery<CountdownData>({
    queryKey: ["next-job", device.id],
    queryFn: async () => {
      const response = await fetch(`${urls.baker}/jobs/${device.id}/next`);
      const data = await response.json();

      if (
        !response.ok ||
        !device?.automation?.on?.minutes ||
        !device?.automation?.off?.minutes
      ) {
        throw new Error("Failed to fetch next execution");
      }

      const secondsUntilNextExecution = Math.floor(
        (new Date(data?.nextExecution).getTime() - new Date().getTime()) / 1000
      );

      if (secondsUntilNextExecution < device.automation.off.minutes * 60) {
        return {
          countdownTime: new Date(data?.nextExecution).getTime(),
          until: "on",
        };
      } else if (device.status === "off") {
        return {
          countdownTime: new Date(data?.nextExecution).getTime(),
          until: "on",
        };
      } else {
        return {
          countdownTime:
            new Date().getTime() +
            (secondsUntilNextExecution - device.automation.off.minutes * 60) *
              1000,
          until: "off",
        };
      }
    },
    refetchInterval: 1000,
  });

  if (!device.automation) {
    return null;
  }

  return (
    data?.countdownTime && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock className="h-3 w-3" />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent
              className="flex flex-col gap-1 items-start border-none"
              side="top"
              sideOffset={10}
            >
              <Label className="text-xs">
                On: {device.automation.on.minutes} minutes
              </Label>
              <Label className="text-xs">
                Off: {device.automation.off.minutes} minutes
              </Label>
            </TooltipContent>
          </Tooltip>
          <span>Going</span>
          <div
            className={`font-medium ${
              data.until === "on" ? "text-emerald-500" : "text-destructive"
            }`}
          >
            {data.until === "on"
              ? device.automation.on.mode
              : device.automation.off.mode}
          </div>
          <ArrowRight className="h-3 w-3" />
          <Countdown
            date={data?.countdownTime}
            daysInHours
            key={`${data?.countdownTime}-${device.id}`}
          />
        </div>
      </motion.div>
    )
  );
}

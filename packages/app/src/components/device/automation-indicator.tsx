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

      if (!response.ok || !device?.automation) {
        throw new Error("Failed to fetch next execution");
      }

      // Ensure we have a valid nextExecution date
      if (!data?.nextExecution) {
        throw new Error("Invalid next execution time");
      }

      const automationType = device.automation.automationType;
      const nextExecutionTime = new Date(data.nextExecution).getTime();
      const currentTime = new Date().getTime();

      // Check if nextExecutionTime is valid (future time)
      if (
        isNaN(nextExecutionTime) ||
        nextExecutionTime <= 0 ||
        nextExecutionTime <= currentTime
      ) {
        console.warn("Invalid or past execution time detected", {
          nextExecutionTime,
          currentTime,
          nextExecutionRaw: data.nextExecution,
          diff: nextExecutionTime - currentTime,
        });

        // Return a fallback value of 30 seconds in the future
        return {
          countdownTime: currentTime + 30000, // 30 seconds
          until: "on", // Default
        };
      }

      const secondsUntilNextExecution = Math.floor(
        (nextExecutionTime - currentTime) / 1000
      );

      console.log("Countdown calculation", {
        nextExecutionTime,
        currentTime,
        diff: nextExecutionTime - currentTime,
        secondsUntilNextExecution,
        automationType,
        device: device.id,
        jobName: data.jobName,
      });

      // For both duration and timeOfDay modes, we can determine the next action
      // by checking if the jobName ends with "_on" or "_off"
      const isNextExecutionOn = data?.jobName?.endsWith("on");
      const isNextExecutionOff = data?.jobName?.endsWith("off");

      // If we have a specific on/off job coming up next
      if (isNextExecutionOn || isNextExecutionOff) {
        return {
          countdownTime: nextExecutionTime,
          until: isNextExecutionOn ? "on" : "off",
        };
      }

      // Fallback for legacy jobs (duration mode without separate on/off jobs)
      if (automationType === "duration") {
        const offMinutes = device.automation.off?.minutes || 0;

        if (secondsUntilNextExecution < offMinutes * 60) {
          return {
            countdownTime: nextExecutionTime,
            until: "on",
          };
        } else if (device.status === "off") {
          return {
            countdownTime: nextExecutionTime,
            until: "on",
          };
        } else {
          const calculatedTime =
            currentTime + (secondsUntilNextExecution - offMinutes * 60) * 1000;

          return {
            countdownTime:
              calculatedTime > currentTime
                ? calculatedTime
                : currentTime + 30000,
            until: "off",
          };
        }
      }

      // Default fallback
      return {
        countdownTime: nextExecutionTime,
        until: device.status === "off" ? "on" : "off",
      };
    },
    refetchInterval: 1500, // Reduced from 1000 to avoid excessive API calls
    retry: 3,
  });

  if (!device.automation) {
    return null;
  }

  function renderTooltipContent() {
    if (!device.automation) return null;

    const { automationType, on, off } = device.automation;

    if (automationType === "duration") {
      return (
        <>
          <Label className="text-xs">On: {on?.minutes} minutes</Label>
          <Label className="text-xs">Off: {off?.minutes} minutes</Label>
        </>
      );
    } else {
      return (
        <>
          <Label className="text-xs">
            On at: {String(on?.hourOfDay || 0).padStart(2, "0")}:
            {String(on?.minuteOfDay || 0).padStart(2, "0")}
          </Label>
          <Label className="text-xs">
            Off at: {String(off?.hourOfDay || 0).padStart(2, "0")}:
            {String(off?.minuteOfDay || 0).padStart(2, "0")}
          </Label>
        </>
      );
    }
  }

  // Check if the data is valid
  const isValidCountdown =
    data?.countdownTime &&
    data.countdownTime > Date.now() &&
    !isNaN(data.countdownTime);

  // Fallback to a short countdown if the data is invalid
  const countdownTime = isValidCountdown
    ? data.countdownTime
    : Date.now() + 10000;

  return (
    data && (
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
              {renderTooltipContent()}
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
          {device.automation.automationType === "timeOfDay" ? (
            <span>
              {new Date(countdownTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          ) : (
            <Countdown
              date={countdownTime}
              daysInHours
              key={`${countdownTime}-${device.id}`}
              renderer={(props) => (
                <span>
                  {props.total > 0
                    ? `${props.hours}:${props.minutes}:${props.seconds}`
                    : "updating..."}
                </span>
              )}
            />
          )}
        </div>
      </motion.div>
    )
  );
}

import { NextModeIndication } from "@/components/device/next-mode-indication";
import { urls } from "@/lib/urls";
import { DeviceAutomation, DeviceResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import { memo } from "react";
import Countdown from "react-countdown";

type CountdownData = {
  countdownTime: number;
  until: "on" | "off";
};

interface AutomationIndicatorProps {
  deviceId: string;
  automation: DeviceAutomation;
  status: DeviceResponse["status"];
}

export const AutomationIndicator = memo(
  ({ deviceId, automation, status }: AutomationIndicatorProps) => {
    const { data } = useQuery<CountdownData>({
      queryKey: ["device", deviceId, "next-job"],
      queryFn: async () => {
        const response = await fetch(`${urls.baker}/jobs/${deviceId}/next`);
        const data = await response.json();

        if (!response.ok || !automation) {
          throw new Error("Failed to fetch next execution");
        }

        // Ensure we have a valid nextExecution date
        if (!data?.nextExecution) {
          throw new Error("Invalid next execution time");
        }

        const automationType = automation.automationType;
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

        const isNextExecutionOn = data?.jobName?.endsWith("on");
        const isNextExecutionOff = data?.jobName?.endsWith("off");

        if (isNextExecutionOn || isNextExecutionOff) {
          return {
            countdownTime: nextExecutionTime,
            until: isNextExecutionOn ? "on" : "off",
          };
        }

        // Fallback for legacy jobs (duration mode without separate on/off jobs)
        if (automationType === "duration") {
          const offMinutes = automation.off?.minutes || 0;

          if (secondsUntilNextExecution < offMinutes * 60) {
            return {
              countdownTime: nextExecutionTime,
              until: "on",
            };
          } else if (status === "off") {
            return {
              countdownTime: nextExecutionTime,
              until: "on",
            };
          } else {
            const calculatedTime =
              currentTime +
              (secondsUntilNextExecution - offMinutes * 60) * 1000;

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
          until: status === "off" ? "on" : "off",
        };
      },
      refetchInterval: 10000, // Reduced from 1000 to avoid excessive API calls
      retry: 3,
    });

    if (!automation) {
      return null;
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
          className="flex-1 w-full text-sm text-muted-foreground"
        >
          <div className="w-full flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Clock className="h-3 w-3" />
            </motion.div>

            <span>Going</span>
            <div
              className={`font-medium ${
                data.until === "on" ? "text-emerald-500" : "text-destructive"
              }`}
            >
              <NextModeIndication
                deviceId={deviceId}
                next={data.until === "on" ? automation.on : automation.off}
              />
            </div>
            <ArrowRight className="h-3 w-3" />
            {automation.automationType === "timeOfDay" ? (
              <span>
                at{" "}
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
                key={`${countdownTime}-${deviceId}`}
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
);

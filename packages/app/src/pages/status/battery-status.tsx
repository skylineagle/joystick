import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevice } from "@/hooks/use-device";
import { runAction } from "@/lib/joystick-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AnimatedBattery } from "./animated-battery";

interface BatteryStatusProps {
  deviceId: string;
}

import { z } from "zod";

const batteryDataSchema = z.object({
  voltage: z.number(),
  current: z.number(),
  power: z.number(),
  consumption: z.number(),
});

type BatteryData = z.infer<typeof batteryDataSchema>;

export function BatteryStatus({ deviceId }: BatteryStatusProps) {
  // Fetch device information to get battery_capacity
  const { data: deviceData } = useDevice(deviceId);
  const batteryCapacity = deviceData?.information?.battery_capacity;

  const { data, isLoading, isRefetching, isError, refetch } =
    useQuery<BatteryData | null>({
      queryKey: ["battery-status", deviceId],
      queryFn: async () => {
        const result = await runAction({
          deviceId,
          action: "get-battery",
          params: {},
        });
        try {
          const parsedResult = batteryDataSchema.parse(
            JSON.parse(result ?? "{}")
          );
          return parsedResult as BatteryData;
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error("Invalid battery data format received from device");
          }

          return null;
        }
      },
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: !!deviceId,
    });

  // Calculate percentage based on consumption and battery capacity
  const calculatePercentage = () => {
    if (!data || !batteryCapacity) return 0;
    const percentage = (data.consumption / batteryCapacity) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const getBatteryColor = () => {
    if (!data) return "text-gray-400";

    const percentage = calculatePercentage();
    if (percentage >= 50) return "text-green-500";
    if (percentage >= 20) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Battery Status</h3>
        <Button
          onClick={() => refetch()}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          <RefreshCw
            className={cn(
              "h-3 w-3",
              isLoading && "animate-spin",
              isRefetching && "animate-spin"
            )}
          />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to fetch battery status
          </p>
        </div>
      ) : data ? (
        <>
          {/* Battery Visual */}
          {batteryCapacity ? (
            <div className="flex items-center justify-center gap-4 p-4">
              <AnimatedBattery percentage={calculatePercentage()} />
              <span className={cn("text-xl font-semibold", getBatteryColor())}>
                {Math.round(calculatePercentage())}%
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 p-4">
              <span className="text-sm text-muted-foreground">
                Battery capacity data is not available
              </span>
            </div>
          )}

          {/* Battery Details in 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 bg-muted/30 rounded-lg p-2 text-sm">
            {/* Voltage */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-xs text-muted-foreground">Voltage</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">
                  {Math.abs(data.voltage / 1000).toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">V</span>
              </div>
            </div>

            {/* Current */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-xs text-muted-foreground">Current</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">
                  {Math.abs(data.current / 1000).toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">mA</span>
              </div>
            </div>

            {/* Power */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-xs text-muted-foreground">Power</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">
                  {Math.abs(data.power / 1000).toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">W</span>
              </div>
            </div>

            {/* Consumption */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-xs text-muted-foreground">Consumption</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">
                  {Math.abs(data.consumption).toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">mWh</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

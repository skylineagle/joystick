import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeviceModel } from "@/hooks/use-device-model";
import { useDeviceTemperature } from "@/hooks/use-device-temperature";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import {
  getTemperatureColor,
  getTemperatureStatus,
} from "@/lib/temperature-utils";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Thermometer } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

export function DeviceTemperatureIndicator() {
  const { device: deviceId } = useParams();
  const { isSupported: isGetTempSupported, isLoading: isSupportedLoading } =
    useIsSupported(deviceId, "get-temp");
  const isDeviceTempPermitted = useIsPermitted("device-temp");
  const { data: deviceModel } = useDeviceModel(deviceId ?? "");
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const {
    data: tempData,
    isLoading: isTempLoading,
    isRefetching: isRefetchingTemp,
    refetch,
  } = useDeviceTemperature(
    deviceId ?? "",
    isGetTempSupported,
    isDeviceTempPermitted,
    () => setLastCheckTime(new Date())
  );

  const handleRefresh = async () => {
    setLastCheckTime(new Date());
    await refetch();
  };

  if (
    !deviceId ||
    isSupportedLoading ||
    !isGetTempSupported ||
    !isDeviceTempPermitted
  ) {
    return null;
  }

  const isLoading = isTempLoading || isRefetchingTemp;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative group">
          {isLoading ? (
            <Badge
              variant="outline"
              className="h-8 px-2 flex items-center gap-1 animate-pulse"
            >
              <div className="h-2 w-2 rounded-full" />
              <span className="text-xs">Checking...</span>
            </Badge>
          ) : tempData ? (
            <Badge
              variant="outline"
              className={cn(
                "h-8 px-2 flex items-center gap-1",
                getTemperatureColor(
                  tempData.temperature,
                  deviceModel?.temp_levels ?? null
                )
              )}
            >
              <Thermometer className="h-3 w-3" />
              <span className="text-xs">
                {tempData.temperature.toFixed(1)}
                {tempData.unit}
              </span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="h-8 px-2 flex items-center gap-1 text-muted-foreground"
            >
              <Thermometer className="h-3 w-3" />
              <span className="text-xs">N/A</span>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-3 w-3", isLoading ? "animate-spin" : "")}
            />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">Device Temperature</p>
          {tempData && (
            <p className="text-sm">
              {getTemperatureStatus(
                tempData.temperature,
                deviceModel?.temp_levels ?? null
              )}{" "}
              ({tempData.temperature.toFixed(1)}
              {tempData.unit})
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {lastCheckTime
              ? `Last checked ${formatDistanceToNow(lastCheckTime, {
                  addSuffix: true,
                })}`
              : "No check performed yet"}
          </p>
          <p className="text-xs text-muted-foreground">Click to refresh</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

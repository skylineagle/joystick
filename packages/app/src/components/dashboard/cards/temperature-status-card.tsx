import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeviceModel } from "@/hooks/use-device-model";
import { useDeviceTemperature } from "@/hooks/use-device-temperature";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import {
  getTemperatureColor,
  getTemperatureStatus,
} from "@/lib/temperature-utils";
import { cn } from "@/lib/utils";
import { TemperatureStatusCardConfig } from "@/types/dashboard-cards";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Thermometer } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "../dashboard-card";

interface TemperatureStatusCardProps {
  config: TemperatureStatusCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export function TemperatureStatusCard({
  config,
  isEditing,
  onEdit,
}: TemperatureStatusCardProps) {
  const { isSupported: isGetTempSupported } = useIsSupported(
    config.deviceId,
    "get-temp"
  );
  const isDeviceTempPermitted = useIsPermitted("device-temp");
  const { data: deviceModel } = useDeviceModel(config.deviceId);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const {
    data: tempData,
    isLoading: isTempLoading,
    isRefetching: isRefetchingTemp,
    refetch,
  } = useDeviceTemperature(
    config.deviceId,
    isGetTempSupported,
    isDeviceTempPermitted,
    () => setLastCheckTime(new Date())
  );

  const handleRefresh = async () => {
    setLastCheckTime(new Date());
    await refetch();
  };

  const isLoading = isTempLoading || isRefetchingTemp;

  return (
    <DashboardCard
      config={{
        ...config,
        visualizationType: "Temperature Status",
      }}
      isEditing={isEditing}
      onEdit={onEdit}
    >
      <div className="relative flex flex-col items-center justify-center h-full p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="absolute top-2 right-2 size-4 z-20"
          disabled={isLoading}
        >
          <RefreshCw
            className={cn("size-4", isLoading ? "animate-spin" : "")}
          />
        </Button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : !isGetTempSupported ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Thermometer className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground text-center">
              Not supported
            </span>
          </div>
        ) : !isDeviceTempPermitted ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Thermometer className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground text-center">
              No permission
            </span>
          </div>
        ) : tempData ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold">
                <span
                  className={getTemperatureColor(
                    tempData.temperature,
                    deviceModel?.temp_levels ?? null
                  )}
                >
                  {tempData.temperature.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground ml-1">
                  {tempData.unit}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "mt-2",
                  getTemperatureColor(
                    tempData.temperature,
                    deviceModel?.temp_levels ?? null
                  )
                )}
              >
                {getTemperatureStatus(
                  tempData.temperature,
                  deviceModel?.temp_levels ?? null
                )}
              </Badge>
            </div>
            {lastCheckTime && (
              <div className="text-xs text-muted-foreground text-center">
                Updated{" "}
                {formatDistanceToNow(lastCheckTime, { addSuffix: true })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Thermometer className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground text-center">
              No data
            </span>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

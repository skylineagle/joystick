import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface TemperatureStatusProps {
  deviceId: string;
}

export function TemperatureStatus({ deviceId }: TemperatureStatusProps) {
  const { isSupported: isGetTempSupported, isLoading: isSupportedLoading } =
    useIsSupported(deviceId, "get-temp");
  const isDeviceTempPermitted = useIsPermitted("device-temp");
  const { data: deviceModel } = useDeviceModel(deviceId);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const {
    data: tempData,
    isLoading: isTempLoading,
    isRefetching: isRefetchingTemp,
    refetch,
  } = useDeviceTemperature(
    deviceId,
    isGetTempSupported,
    isDeviceTempPermitted,
    () => setLastCheckTime(new Date())
  );

  const handleRefresh = async () => {
    setLastCheckTime(new Date());
    await refetch();
  };

  if (isSupportedLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-muted-foreground">
          Checking temperature support...
        </div>
      </div>
    );
  }

  if (!isGetTempSupported) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Temperature monitoring is not supported by this device
          </p>
        </div>
      </div>
    );
  }

  if (!isDeviceTempPermitted) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            You don't have permission to view temperature data
          </p>
        </div>
      </div>
    );
  }

  const isLoading = isTempLoading || isRefetchingTemp;

  const getTemperatureSeverity = (temp: number) => {
    if (temp < 30) return "low";
    if (temp < 50) return "normal";
    if (temp < 70) return "warning";
    return "critical";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Thermometer className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Temperature Status</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isLoading ? "animate-spin" : "")}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Current Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : tempData ? (
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold">
                  <span
                    className={getTemperatureColor(
                      tempData.temperature,
                      deviceModel?.temp_levels ?? null
                    )}
                  >
                    {tempData.temperature.toFixed(1)}
                  </span>
                  <span className="text-2xl text-muted-foreground ml-2">
                    {tempData.unit}
                  </span>
                </div>
                <Badge
                  variant={
                    getTemperatureSeverity(tempData.temperature) === "critical"
                      ? "destructive"
                      : getTemperatureSeverity(tempData.temperature) ===
                        "warning"
                      ? "secondary"
                      : "default"
                  }
                  className="text-lg px-4 py-2"
                >
                  {getTemperatureStatus(
                    tempData.temperature,
                    deviceModel?.temp_levels ?? null
                  )}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No temperature data available
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium">
                  {tempData
                    ? getTemperatureStatus(
                        tempData.temperature,
                        deviceModel?.temp_levels ?? null
                      )
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Severity:</span>
                <span className="text-sm font-medium">
                  {tempData
                    ? getTemperatureSeverity(tempData.temperature)
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Updated:
                </span>
                <span className="text-sm font-medium">
                  {lastCheckTime
                    ? formatDistanceToNow(lastCheckTime, { addSuffix: true })
                    : "Never"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Temperature Ranges:</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-500">Cool:</span>
                  <span>&lt; 30{tempData?.unit || "°C"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-500">Normal:</span>
                  <span>30 - 50{tempData?.unit || "°C"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-500">Warm:</span>
                  <span>50 - 70{tempData?.unit || "°C"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-500">Hot:</span>
                  <span>&gt; 70{tempData?.unit || "°C"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

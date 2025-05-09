import { ConfigurationEditor } from "@/components/configuration/configuration-editor";
import { ResetDevice } from "@/components/device/reset-device";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApplicationSettings } from "@/hooks/use-application-settings";
import { useDevice } from "@/hooks/use-device";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

export function DeviceHealthIndicator() {
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId ?? "");
  const { isSupported: isHealthcheckSupported, isLoading: isSupportedLoading } =
    useIsSupported(deviceId ?? "", "healthcheck");
  const { isSupported: isResetSupported } = useIsSupported(
    deviceId ?? "",
    "reset"
  );
  const { generalSettings } = useApplicationSettings();
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const isAllowedToEditDevice = useIsPermitted("edit-device");
  const {
    data: isConnected,
    isLoading: isHealthcheckLoading,
    isRefetching: isRefetchingHealthcheck,
    refetch,
  } = useQuery({
    queryKey: ["healthcheck-indicator", deviceId, isHealthcheckSupported],
    queryFn: async () => {
      if (!isHealthcheckSupported) return false;
      const data = await runAction({
        deviceId: deviceId!,
        action: "healthcheck",
        params: {},
        timeout: generalSettings.healthcheckTimeout * 1000,
      });

      setLastCheckTime(new Date());
      return data === "true";
    },
    enabled: !!deviceId && isHealthcheckSupported,
    refetchInterval: generalSettings.healthCheckInterval * 1000 || 5000,
  });

  const handleRefresh = async () => {
    await refetch();
  };

  if (!deviceId || isSupportedLoading || !isHealthcheckSupported) {
    return null;
  }

  const isLoading = isHealthcheckLoading;

  return (
    <div className="flex items-center gap-2">
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
            ) : isConnected ? (
              <Badge
                variant="outline"
                className="h-8 px-2 flex items-center gap-1 text-emerald-500 dark:text-green-300"
              >
                <Wifi className="h-3 w-3" />
                <span className="text-xs">Connected</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="h-8 px-2 flex items-center gap-1 text-rose-600 dark:text-red-300"
              >
                <WifiOff className="h-3 w-3" />
                <span className="text-xs">Disconnected</span>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRefresh}
              disabled={isLoading || isRefetchingHealthcheck}
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3",
                  isLoading || isRefetchingHealthcheck ? "animate-spin" : ""
                )}
              />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {lastCheckTime
              ? `Last checked ${formatDistanceToNow(lastCheckTime, {
                  addSuffix: true,
                })}`
              : "No check performed yet"}
          </p>
          <p className="text-xs text-muted-foreground">Click to refresh</p>
        </TooltipContent>
      </Tooltip>

      {device && isAllowedToEditDevice && (
        <ConfigurationEditor device={device} />
      )}

      {isResetSupported && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ResetDevice deviceId={deviceId ?? ""} disable={!isConnected} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Device</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

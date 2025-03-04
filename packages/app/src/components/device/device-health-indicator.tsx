import { ResetDevice } from "@/components/device/reset-device";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { useParams } from "react-router-dom";

export function DeviceHealthIndicator() {
  const { device: deviceId } = useParams();
  const { isSupported: isHealthcheckSupported, isLoading: isSupportedLoading } =
    useIsSupported(deviceId ?? "", "healthcheck");
  const { isSupported: isResetSupported } = useIsSupported(
    deviceId ?? "",
    "reset"
  );

  const { data: isConnected, isLoading: isHealthcheckLoading } = useQuery({
    queryKey: ["healthcheck-indicator", deviceId, isHealthcheckSupported],
    queryFn: async () => {
      if (!isHealthcheckSupported) return false;
      const data = await runAction({
        deviceId: deviceId!,
        action: "healthcheck",
        params: {},
      });
      return data === "true";
    },
    enabled: !!deviceId && isHealthcheckSupported,
    refetchInterval: 10000,
  });

  if (!deviceId || isSupportedLoading || !isHealthcheckSupported) {
    return null;
  }

  const isLoading = isHealthcheckLoading;

  return (
    <div className="flex items-center gap-2">
      {isLoading || !isHealthcheckSupported ? (
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
          className="h-8 px-2 flex items-center gap-1  text-emerald-500 dark:text-green-300"
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

      {isResetSupported && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ResetDevice deviceId={deviceId ?? ""} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Device</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

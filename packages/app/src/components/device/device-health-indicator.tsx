import { Badge } from "@/components/ui/badge";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { useParams } from "react-router-dom";

export function DeviceHealthIndicator() {
  const { device: deviceId } = useParams();
  const { isSupported, isLoading: isSupportedLoading } = useIsSupported(
    deviceId ?? "",
    "healthcheck"
  );

  const { data: isConnected, isLoading: isHealthcheckLoading } = useQuery({
    queryKey: ["healthcheck-indicator", deviceId, isSupported],
    queryFn: async () => {
      if (!isSupported) return false;
      const data = await runAction({
        deviceId: deviceId!,
        action: "healthcheck",
        params: {},
      });
      console.log(data);
      return data === "true";
    },
    enabled: !!deviceId && isSupported,
    refetchInterval: 10000,
  });

  if (!deviceId || isSupportedLoading || !isSupported) {
    return null;
  }

  const isLoading = isHealthcheckLoading;

  return (
    <div className="flex items-center">
      {isLoading || !isSupported ? (
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
          className="h-8 px-2 flex items-center gap-1  text-green-800 dark:text-green-300"
        >
          <Wifi className="h-3 w-3" />
          <span className="text-xs">Connected</span>
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="h-8 px-2 flex items-center gap-1 text-red-800 dark:text-red-300"
        >
          <WifiOff className="h-3 w-3" />
          <span className="text-xs">Disconnected</span>
        </Badge>
      )}
    </div>
  );
}

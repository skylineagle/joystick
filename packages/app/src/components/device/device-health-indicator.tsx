import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAction } from "@/hooks/use-action";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Power, Wifi, WifiOff } from "lucide-react";
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
      console.log(data);
      return data === "true";
    },
    enabled: !!deviceId && isHealthcheckSupported,
    refetchInterval: 10000,
  });

  const { runAction: runReset, isRunning: isResetRunning } = useAction(
    deviceId ?? "",
    "reset"
  );

  async function handleReset() {
    if (!deviceId) return;

    try {
      runReset({
        params: {},
      });
    } catch (error) {
      console.error("Failed to reset device:", error);
    }
  }

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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleReset}
              disabled={isResetRunning}
            >
              {isResetRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              <span className="sr-only">Reset Device</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Device</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

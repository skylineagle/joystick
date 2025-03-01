import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { runAction } from "@/lib/joystick-api";
import { ConnectionStatus } from "@/pages/status/connection-status";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

interface HealthcheckProps {
  deviceId: string;
}

export function Healthcheck({ deviceId }: HealthcheckProps) {
  const {
    data: healthcheck,
    isLoading: isHealthcheckLoading,
    refetch: refetchHealthcheck,
  } = useQuery({
    queryKey: ["healthcheck", deviceId],
    queryFn: async () => {
      const data = await runAction({
        deviceId: deviceId!,
        action: "healthcheck",
        params: {},
      });

      if (typeof data === "string") {
        const parsedData = JSON.parse(data);
        return {
          status: parsedData.status,
          lastConnected: parsedData.lastConnected || "N/A",
        };
      }

      return data;
    },
    enabled: !!deviceId,
  });

  return (
    <Card key="connection" className="shadow-md h-full">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Connection Status</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetchHealthcheck()}
          disabled={isHealthcheckLoading}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh connection status</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isHealthcheckLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : (
          <ConnectionStatus data={healthcheck} />
        )}
      </CardContent>
    </Card>
  );
}

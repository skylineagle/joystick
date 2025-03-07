import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { runAction } from "@/lib/joystick-api";
import { parseCPSIResult } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
} from "lucide-react";

interface CellularStatusProps {
  deviceId: string;
}

export function CellularStatus({ deviceId }: CellularStatusProps) {
  const {
    data,
    isLoading: isCpsiLoading,
    refetch: refetchCpsi,
  } = useQuery({
    queryKey: ["cpsi", deviceId],
    queryFn: async () => {
      const data = await runAction({
        deviceId: deviceId!,
        action: "get-cpsi",
        params: {},
      });

      try {
        return JSON.parse(data ?? "");
      } catch {
        return parseCPSIResult(data ?? "");
      }
    },
    enabled: !!deviceId,
  });

  if (!data) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        No cellular data available
      </div>
    );
  }

  const getSignalIcon = () => {
    // For LTE, use RSRP as the signal quality indicator
    if (data.technology === "LTE" && data.rsrp !== undefined) {
      // RSRP ranges typically from -140 dBm (poor) to -80 dBm (excellent)
      if (data.rsrp >= -80)
        return <SignalHigh className="h-5 w-5 text-green-500" />;
      if (data.rsrp >= -100)
        return <SignalMedium className="h-5 w-5 text-green-400" />;
      if (data.rsrp >= -110)
        return <SignalLow className="h-5 w-5 text-yellow-500" />;
      return <SignalZero className="h-5 w-5 text-red-500" />;
    }

    // For GSM and WCDMA, use RSSI as the signal quality indicator
    if (data.rssi !== undefined) {
      // RSSI ranges typically from -110 dBm (poor) to -70 dBm (excellent)
      if (data.rssi >= -70)
        return <SignalHigh className="h-5 w-5 text-green-500" />;
      if (data.rssi >= -85)
        return <SignalMedium className="h-5 w-5 text-green-400" />;
      if (data.rssi >= -100)
        return <SignalLow className="h-5 w-5 text-yellow-500" />;
      return <SignalZero className="h-5 w-5 text-red-500" />;
    }

    return <Signal className="h-5 w-5 text-muted-foreground" />;
  };

  const getNetworkTypeBadge = (technology: string) => {
    const colors = {
      LTE: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
      GSM: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300",
      WCDMA:
        "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300",
    };

    return (
      <Badge
        variant="outline"
        className={
          colors[technology as keyof typeof colors] ||
          "bg-gray-100 dark:bg-gray-900/20"
        }
      >
        {technology}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | undefined) => {
    if (
      status?.toLowerCase() === "online" ||
      status?.toLowerCase() === "connected"
    ) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
        >
          {status}
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
      >
        {status}
      </Badge>
    );
  };

  // Helper function to format signal metrics
  const formatSignalMetric = (value: number | undefined, unit: string) => {
    if (value === undefined) return "N/A";
    return `${value} ${unit}`;
  };

  return (
    <div className="h-[200px] p-4 pt-0 max-w-full overflow-hidden">
      {isCpsiLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ) : (
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between gap-1 flex-wrap w-full">
            <div className="flex items-center gap-1 min-w-0 truncate">
              {getSignalIcon()}
              <span className="font-medium text-sm truncate">
                {data?.operator || "Unknown Operator"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetchCpsi()}
              disabled={isCpsiLoading}
              className="h-7 w-7 flex-shrink-0"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="sr-only">Refresh cellular status</span>
            </Button>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {getNetworkTypeBadge(data?.technology)}
            {getStatusBadge(data?.status)}
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-2 pt-1 text-xs w-full">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">MCC-MNC</span>
              <span className="truncate">{data?.mccMnc || "N/A"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Band</span>
              <span className="truncate">{data?.band || "N/A"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">ARFCN</span>
              <span className="truncate">
                {data?.arfcn !== undefined ? data?.arfcn : "N/A"}
              </span>
            </div>

            {data?.technology === "LTE" ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">RSRP</span>
                  <span className="truncate">
                    {formatSignalMetric(data?.rsrp, "dBm")}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">SINR</span>
                  <span className="truncate">
                    {formatSignalMetric(data?.sinr, "dB")}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">RSRQ</span>
                  <span className="truncate">
                    {formatSignalMetric(data?.rsrq, "dB")}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">RSSI</span>
                  <span className="truncate">
                    {formatSignalMetric(data?.rssi, "dBm")}
                  </span>
                </div>

                {data?.technology === "GSM" && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">BSIC</span>
                    <span className="truncate">
                      {data?.bsic !== undefined ? data?.bsic : "N/A"}
                    </span>
                  </div>
                )}

                {data?.technology === "GSM" &&
                  data?.timingAdvance !== undefined && (
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Timing Adv
                      </span>
                      <span className="truncate">{data?.timingAdvance}</span>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

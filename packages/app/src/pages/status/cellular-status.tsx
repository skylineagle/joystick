import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { runAction } from "@/lib/joystick-api";
import { cn, parseCPSIResult } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Clock, RefreshCw } from "lucide-react";

interface CellularStatusProps {
  deviceId: string;
}

export function CellularStatus({ deviceId }: CellularStatusProps) {
  const {
    data,
    isLoading: isCpsiLoading,
    isRefetching: isCpsiRefetching,
    refetch: refetchCpsi,
    dataUpdatedAt,
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

  const getSignalBars = () => {
    let signalValue = 0;

    // For LTE, use RSRP as the signal quality indicator
    if (data.technology === "LTE" && data.rsrp !== undefined) {
      signalValue = data.rsrp;
    } else if (data.rssi !== undefined) {
      // For GSM and WCDMA, use RSSI as the signal quality indicator
      signalValue = data.rssi;
    }

    const getBars = (value: number) => {
      if (value >= -80) return 4;
      if (value >= -90) return 3;
      if (value >= -100) return 2;
      if (value >= -110) return 1;
      return 0;
    };

    const getSignalColor = (value: number) => {
      if (value >= -80) return "bg-green-500";
      if (value >= -90) return "bg-yellow-500";
      if (value >= -100) return "bg-orange-500";
      return "bg-red-500";
    };

    const bars = getBars(signalValue);
    const signalColor = getSignalColor(signalValue);

    return (
      <div className="flex gap-1 items-end">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-sm transition-colors",
              i < bars ? signalColor : "bg-gray-200 dark:bg-gray-700",
              i === 0 ? "h-2" : i === 1 ? "h-3" : i === 2 ? "h-4" : "h-5"
            )}
          />
        ))}
      </div>
    );
  };

  const getNetworkTypeBadge = (technology: string) => {
    const colors = {
      LTE: "bg-chart-1/10 text-chart-1 border-chart-1/20",
      GSM: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      WCDMA: "bg-chart-5/10 text-chart-5 border-chart-5/20",
    };

    const getGenerationLabel = () => {
      return !technology
        ? "Unknown"
        : technology === "LTE"
        ? "4G"
        : technology === "GSM"
        ? "2G"
        : "3G";
    };

    const generationLabel = getGenerationLabel();

    const getGenerationBadgeColor = (label: string) => {
      const genColors = {
        "4G+": "bg-chart-1/10 text-chart-1 border-chart-1/20",
        "4G": "bg-chart-2/10 text-chart-2 border-chart-2/20",
        "3G+": "bg-chart-3/10 text-chart-3 border-chart-3/20",
        "3G": "bg-chart-4/10 text-chart-4 border-chart-4/20",
        "2.5G": "bg-chart-5/10 text-chart-5 border-chart-5/20",
        "2G": "bg-destructive/10 text-destructive border-destructive/20",
      };

      return (
        genColors[label as keyof typeof genColors] ||
        "bg-muted/10 text-muted-foreground border-muted/20"
      );
    };

    return (
      <div className="flex items-center gap-1">
        <Badge
          variant="outline"
          className={
            colors[technology as keyof typeof colors] ||
            "bg-muted/10 text-muted-foreground border-muted/20"
          }
        >
          {technology}
        </Badge>
        {generationLabel && (
          <Badge
            variant="outline"
            className={getGenerationBadgeColor(generationLabel)}
          >
            {generationLabel}
          </Badge>
        )}
      </div>
    );
  };

  // Helper function to format signal metrics
  const formatSignalMetric = (value: number | undefined, unit: string) => {
    if (value === undefined) return "N/A";
    return `${value} ${unit}`;
  };

  // Format the time since last update
  const timeSinceUpdate = dataUpdatedAt
    ? formatDistanceToNow(dataUpdatedAt, { addSuffix: true })
    : "just now";

  return (
    <div className="h-full w-full p-4 pt-0 overflow-y-auto">
      {isCpsiLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ) : (
        <div className="space-y-3 w-full">
          {/* Metadata row with timestamp and refresh button */}
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center text-[10px] text-muted-foreground opacity-70">
              <Clock className="h-2.5 w-2.5 mr-1" />
              <span>{timeSinceUpdate}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetchCpsi()}
              disabled={isCpsiLoading || isCpsiRefetching}
              className="h-5 w-5 flex-shrink-0"
            >
              <RefreshCw
                className={cn(
                  "h-2.5 w-2.5",
                  isCpsiLoading && "animate-spin",
                  isCpsiRefetching && "animate-spin"
                )}
              />
              <span className="sr-only">Refresh cellular status</span>
            </Button>
          </div>

          {/* Cellular data content */}
          <div className="flex items-center justify-between gap-1 flex-wrap w-full">
            <div className="flex items-center gap-2 min-w-0 truncate">
              {getSignalBars()}
              {getNetworkTypeBadge(data?.technology)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Provider:</span>
            <span className="text-xs font-medium truncate">
              {data?.operator || "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Cell ID:</span>
            <span className="text-xs font-medium truncate">
              {data?.cellId || "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs w-full">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Band</span>
              <span className="truncate">{data?.band || "N/A"}</span>
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

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SignalBars,
  TechnologyBadge,
  SignalMetric,
  CellInfoDisplay,
} from "@/components/ui/cell";
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

  const getSignalValue = () => {
    // For LTE, use RSRP as the signal quality indicator
    if (data.technology === "LTE" && data.rsrp !== undefined) {
      return data.rsrp;
    } else if (data.rssi !== undefined) {
      // For GSM and WCDMA, use RSSI as the signal quality indicator
      return data.rssi;
    }
    return -120; // Default poor signal value
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
              <SignalBars value={getSignalValue()} size="sm" />
              <TechnologyBadge
                technology={data?.technology || "Unknown"}
                showGeneration
              />
            </div>
          </div>

          <CellInfoDisplay
            label="Provider"
            value={data?.operator || "Unknown"}
          />

          <CellInfoDisplay label="Cell ID" value={data?.cellId} mono />

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs w-full">
            <CellInfoDisplay
              label="Band"
              value={data?.band}
              layout="vertical"
            />

            {data?.technology === "LTE" ? (
              <>
                <SignalMetric
                  value={data?.rsrp}
                  unit="dBm"
                  label="RSRP"
                  type="rsrp"
                />

                <SignalMetric
                  value={data?.sinr}
                  unit="dB"
                  label="SINR"
                  type="sinr"
                />

                <SignalMetric
                  value={data?.rsrq}
                  unit="dB"
                  label="RSRQ"
                  type="rsrq"
                />
              </>
            ) : (
              <>
                <SignalMetric
                  value={data?.rssi}
                  unit="dBm"
                  label="RSSI"
                  type="rssi"
                  technology={data?.technology}
                />

                {data?.technology === "GSM" && (
                  <CellInfoDisplay
                    label="BSIC"
                    value={data?.bsic}
                    layout="vertical"
                  />
                )}

                {data?.technology === "GSM" &&
                  data?.timingAdvance !== undefined && (
                    <CellInfoDisplay
                      label="Timing Adv"
                      value={data?.timingAdvance}
                      layout="vertical"
                    />
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

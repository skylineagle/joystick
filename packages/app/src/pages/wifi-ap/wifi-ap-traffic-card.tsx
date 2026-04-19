import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WifiTraffic } from "@/hooks/use-wifi-ap";
import { Activity, ArrowDown, ArrowUp } from "lucide-react";

type WifiApTrafficCardProps = {
  traffic: WifiTraffic | undefined;
  prevTraffic: WifiTraffic | undefined;
  isLoading: boolean;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const formatDelta = (current: number, previous: number): string => {
  const delta = current - previous;
  if (delta <= 0) return "0 B/s";
  return `${formatBytes(delta)}/s`;
};

export const WifiApTrafficCard = ({
  traffic,
  prevTraffic,
  isLoading,
}: WifiApTrafficCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasDelta = !!prevTraffic && !!traffic;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Network Traffic
          {traffic?.interface && (
            <span className="text-xs font-normal text-muted-foreground font-mono">
              ({traffic.interface})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUp className="h-3.5 w-3.5 text-blue-500" />
              Upload (TX)
            </div>
            <p className="text-lg font-semibold">
              {traffic ? formatBytes(traffic.txBytes) : "—"}
            </p>
            {hasDelta && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUp className="h-3 w-3 text-blue-400" />
                {formatDelta(traffic!.txBytes, prevTraffic!.txBytes)}
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDown className="h-3.5 w-3.5 text-green-500" />
              Download (RX)
            </div>
            <p className="text-lg font-semibold">
              {traffic ? formatBytes(traffic.rxBytes) : "—"}
            </p>
            {hasDelta && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowDown className="h-3 w-3 text-green-400" />
                {formatDelta(traffic!.rxBytes, prevTraffic!.rxBytes)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">TX Packets</p>
            <p className="font-medium">{traffic?.txPackets?.toLocaleString() ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">RX Packets</p>
            <p className="font-medium">{traffic?.rxPackets?.toLocaleString() ?? "—"}</p>
          </div>
        </div>

        {traffic?.timestamp && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(traffic.timestamp).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

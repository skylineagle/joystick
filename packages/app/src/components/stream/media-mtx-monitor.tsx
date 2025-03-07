import { useDevice } from "@/hooks/use-device";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/toast";
import { Activity, CheckCircle, MegaphoneOff } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaMtxMonitorProps {
  deviceName: string;
}

interface MediaMtxPathResponse {
  name: string;
  ready: boolean;
  readyTime: string;
  lastBytesReceived: number;
  bytesReceived: number;
  bytesSent: number;
  tracks: Record<string, unknown>[];
  readers: Record<string, unknown>[];
}

type ConnectionStatus =
  | "connected"
  | "degraded"
  | "disconnected"
  | "initializing";
type ConnectionQuality = "excellent" | "good" | "fair" | "poor";

const qualityConfig = {
  excellent: { label: "Excellent", color: "bg-green-500", width: "w-full" },
  good: { label: "Good", color: "bg-green-400", width: "w-3/4" },
  fair: { label: "Fair", color: "bg-yellow-400", width: "w-1/2" },
  poor: { label: "Poor", color: "bg-red-500", width: "w-1/4" },
};

export function MediaMtxMonitor({ deviceName }: MediaMtxMonitorProps) {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("initializing");
  const { data: device } = useDevice(deviceName);
  const [qualityScore, setQualityScore] = useState<ConnectionQuality>("good");
  const [lastBytesReceived, setLastBytesReceived] = useState<number>(0);
  const [throughput, setThroughput] = useState<number>(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentTime = Date.now();
        const response = await fetch(
          `${urls.stream_api}/v3/paths/get/${deviceName}`
        );

        if (!response.ok) {
          setConnectionStatus("disconnected");
          return;
        }

        const path: MediaMtxPathResponse = await response.json();

        if (!path) {
          setConnectionStatus("disconnected");
          return;
        }

        // Update connection status based on ready state
        const newStatus: ConnectionStatus = path.ready
          ? "connected"
          : "disconnected";
        if (connectionStatus === "disconnected" && newStatus === "connected") {
          toast.success({
            message: "Stream connection restored",
          });
        } else if (
          connectionStatus === "connected" &&
          newStatus === "disconnected"
        ) {
          toast.error({
            message: "Stream connection lost",
          });
        }

        setConnectionStatus(newStatus);

        // Calculate throughput based on actual time difference
        const currentBytesReceived = path.bytesReceived;

        if (lastBytesReceived > 0) {
          const byteDiff = currentBytesReceived - lastBytesReceived;

          // Calculate time difference in seconds since last update
          const timeDiffMs = currentTime - lastFetchTime;
          const timeDiffSeconds = timeDiffMs / 1000;

          // Only calculate throughput if time difference is valid
          if (timeDiffSeconds > 0) {
            const newThroughput = byteDiff / timeDiffSeconds;
            setThroughput(newThroughput);

            // Update quality score based on throughput (in KB/s)
            const kbps = newThroughput / 1024;
            let newQuality: ConnectionQuality = "excellent";

            if (
              kbps <
              (device?.expand?.device.stream_quality?.[device.mode]?.poor ?? 50)
            )
              newQuality = "poor";
            else if (
              kbps <
              (device?.expand?.device.stream_quality?.[device.mode]?.fair ??
                100)
            )
              newQuality = "fair";
            else if (
              kbps <
              (device?.expand?.device.stream_quality?.[device.mode]?.good ??
                150)
            )
              newQuality = "good";
            else newQuality = "excellent";

            setQualityScore(newQuality);

            // If throughput is abnormally low but connection is ready
            if (kbps < 50 && path.ready) {
              setConnectionStatus("degraded");
            }
          }
        }

        setLastBytesReceived(currentBytesReceived);
        setLastFetchTime(currentTime);
      } catch (error) {
        console.error("Error fetching MediaMTX status:", error);
        setConnectionStatus("disconnected");
      }
    }, 3000); // Check every 3 seconds

    // Initial fetch on mount
    const initialFetch = async () => {
      try {
        const response = await fetch(
          `${urls.stream_api}/v3/paths/get/${deviceName}`
        );
        if (response.ok) {
          const path: MediaMtxPathResponse = await response.json();

          if (path) {
            setConnectionStatus(path.ready ? "connected" : "disconnected");
            setLastBytesReceived(path.bytesReceived);
          }
        }
      } catch (error) {
        console.error("Error during initial fetch:", error);
      }
    };

    initialFetch();

    return () => {
      clearInterval(interval);
    };
  }, [
    deviceName,
    connectionStatus,
    lastBytesReceived,
    lastFetchTime,
    device?.expand?.device.stream_quality,
    device?.mode,
  ]);

  const statusConfig = {
    initializing: {
      icon: <Activity className="h-4 w-4 text-blue-500" />,
      label: "Initializing",
    },
    connected: {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      label: "Connected",
    },
    degraded: {
      icon: <Activity className="h-4 w-4 text-yellow-500" />,
      label: "Degraded",
    },
    disconnected: {
      icon: <MegaphoneOff className="h-4 w-4 text-red-500" />,
      label: "Disconnected",
    },
  };

  // Format throughput
  const formatThroughput = (bps: number): string => {
    const kbps = bps / 1024;
    if (kbps < 1000) {
      return `${kbps.toFixed(1)} KB/s`;
    } else {
      return `${(kbps / 1024).toFixed(2)} MB/s`;
    }
  };

  // Render the Stream Performance tab content
  const { icon, label } = statusConfig[connectionStatus];
  const {
    label: qualityLabel,
    color: qualityColor,
    width,
  } = qualityConfig[qualityScore];

  return (
    <div className="flex flex-col gap-2 mb-4 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {connectionStatus === "connected" && formatThroughput(throughput)}
        </span>
      </div>

      {connectionStatus !== "disconnected" && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span>Stream quality</span>
            <span className="text-xs">{qualityLabel}</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full w-full overflow-hidden mb-4">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                qualityColor,
                width
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

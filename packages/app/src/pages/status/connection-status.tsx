import { Badge } from "@/components/ui/badge";
import { Clock, Wifi, WifiOff } from "lucide-react";
import TimeAgo from "react-timeago";

interface ConnectionStatusData {
  status: string;
  lastConnected: string;
}

interface ConnectionStatusProps {
  data: ConnectionStatusData | null;
}

export function ConnectionStatus({ data }: ConnectionStatusProps) {
  if (!data) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        No connection data available
      </div>
    );
  }

  const isConnected =
    data.status.toLowerCase() === "connected" ||
    data.status.toLowerCase() === "online";

  const getStatusBadge = (status: string) => {
    if (
      status.toLowerCase() === "connected" ||
      status.toLowerCase() === "online"
    ) {
      return (
        <Badge
          variant="outline"
          className="bg-chart-2/10 text-chart-2 border-chart-2/20"
        >
          {status}
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/20"
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-chart-2" />
          ) : (
            <WifiOff className="h-5 w-5 text-destructive" />
          )}
          <span className="font-medium">Connection Status</span>
        </div>
        <div>{getStatusBadge(data.status)}</div>
      </div>

      <div className="pt-2">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last Connected</span>
        </div>
        <span className="font-medium">
          <TimeAgo date={new Date(data.lastConnected)} />
        </span>
      </div>
    </div>
  );
}

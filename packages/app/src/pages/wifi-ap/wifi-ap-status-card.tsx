import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WifiApStatus } from "@/hooks/use-wifi-ap";
import { Shield, Users, Wifi, Zap } from "lucide-react";

type WifiApStatusCardProps = {
  status: WifiApStatus | undefined;
  isLoading: boolean;
};

const securityLabel = (security: string) => {
  if (security === "psk2") return "WPA2";
  if (security === "psk") return "WPA";
  return "Open";
};

export const WifiApStatusCard = ({ status, isLoading }: WifiApStatusCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-4 w-4" />
            Access Point Status
          </CardTitle>
          <Badge
            variant={status?.enabled ? "default" : "destructive"}
            className={
              status?.enabled
                ? "bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20"
                : ""
            }
          >
            {status?.enabled ? "Active" : "Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">SSID</p>
          <p className="font-semibold text-sm">{status?.ssid ?? "—"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Channel</p>
            <p className="text-sm font-medium">{status?.channel ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Band</p>
            <p className="text-sm font-medium">{status?.band ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Frequency</p>
            <p className="text-sm font-medium">
              {status?.frequency ? `${status.frequency} MHz` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Security
            </p>
            <p className="text-sm font-medium">
              {status?.security ? securityLabel(status.security) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              TX Power
            </p>
            <p className="text-sm font-medium">
              {status?.txPower !== undefined ? `${status.txPower} dBm` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Clients
            </p>
            <p className="text-sm font-medium">{status?.clientCount ?? 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

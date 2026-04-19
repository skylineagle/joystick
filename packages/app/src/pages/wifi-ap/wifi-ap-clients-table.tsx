import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WifiClient } from "@/hooks/use-wifi-ap";
import { toast } from "@/utils/toast";
import { RefreshCw, Users } from "lucide-react";
import { useState } from "react";

type WifiApClientsTableProps = {
  clients: WifiClient[] | undefined;
  isLoading: boolean;
  onRefresh: () => Promise<unknown>;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const SignalBadge = ({ signal }: { signal: number }) => {
  const isGood = signal >= -60;
  const isFair = signal >= -70 && signal < -60;

  const className = isGood
    ? "bg-green-500/15 text-green-600 border-green-500/30"
    : isFair
    ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/30"
    : "bg-red-500/15 text-red-600 border-red-500/30";

  return (
    <Badge variant="outline" className={className}>
      {signal} dBm
    </Badge>
  );
};

export const WifiApClientsTable = ({ clients, isLoading, onRefresh }: WifiApClientsTableProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch {
      toast.error({ message: "Failed to refresh client list" });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Connected Clients
            {clients && clients.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {clients.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            aria-label="Refresh client list"
            tabIndex={0}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 transition-transform duration-300 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !isRefreshing ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !clients || clients.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No clients connected
          </div>
        ) : (
          <div className={`relative transition-opacity duration-200 ${isRefreshing ? "opacity-50" : "opacity-100"}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MAC</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>TX</TableHead>
                  <TableHead>RX</TableHead>
                  <TableHead>Connected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.mac}>
                    <TableCell className="font-mono text-xs">{client.mac}</TableCell>
                    <TableCell className="font-mono text-xs">{client.ip}</TableCell>
                    <TableCell className="text-sm">{client.hostname || "—"}</TableCell>
                    <TableCell>
                      <SignalBadge signal={client.signal} />
                    </TableCell>
                    <TableCell className="text-xs">{formatBytes(client.txBytes)}</TableCell>
                    <TableCell className="text-xs">{formatBytes(client.rxBytes)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(client.connectedSince).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

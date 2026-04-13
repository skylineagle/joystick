import { Badge } from "@/components/ui/badge";
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
import { Users } from "lucide-react";

type WifiApClientsTableProps = {
  clients: WifiClient[] | undefined;
  isLoading: boolean;
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

export const WifiApClientsTable = ({ clients, isLoading }: WifiApClientsTableProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Connected Clients
          {clients && clients.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {clients.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
        )}
      </CardContent>
    </Card>
  );
};

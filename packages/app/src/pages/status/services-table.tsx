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
import { runAction } from "@/lib/joystick-api";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";

interface ServiceData {
  name: string;
  status: string;
  uptime?: string;
  memory?: string;
  cpu?: string;
}
interface ServicesTableProps {
  deviceId: string;
}

export function ServicesTable({ deviceId }: ServicesTableProps) {
  const {
    data,
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ["services", deviceId],
    queryFn: async (): Promise<ServiceData[]> => {
      const data = await runAction({
        deviceId: deviceId!,
        action: "get-services-status",
        params: {},
      });

      if (typeof data === "string") {
        return JSON.parse(data);
      }

      return data;
    },

    enabled: !!deviceId,
  });
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        No services data available
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
      case "online":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "stopped":
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
      case "online":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
          >
            {status}
          </Badge>
        );
      case "stopped":
      case "offline":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
          >
            {status}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card key="services" className="shadow-md h-full">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Services Status</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetchServices()}
          disabled={isServicesLoading}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh services</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isServicesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>CPU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        {getStatusBadge(service.status)}
                      </div>
                    </TableCell>
                    <TableCell>{service.uptime || "N/A"}</TableCell>
                    <TableCell>{service.memory || "N/A"}</TableCell>
                    <TableCell>{service.cpu || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

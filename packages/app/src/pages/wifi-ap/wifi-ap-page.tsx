import { Button } from "@/components/ui/button";
import { useIsSupported } from "@/hooks/use-is-supported";
import { ApiError } from "@/lib/api-client";
import {
  WifiTraffic,
  useWifiApStatus,
  useWifiClients,
  useWifiConfig,
  useWifiTraffic,
} from "@/hooks/use-wifi-ap";
import { RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { WifiApClientsTable } from "./wifi-ap-clients-table";
import { WifiApConfigForm } from "./wifi-ap-config-form";
import { WifiApStatusCard } from "./wifi-ap-status-card";
import { WifiApTrafficCard } from "./wifi-ap-traffic-card";

export const WifiApPage = () => {
  const { device: deviceId } = useParams<{ device: string }>();
  const { isSupported } = useIsSupported(deviceId!, "get-wifi-ap-status");

  const {
    data: status,
    isLoading: statusLoading,
    isError: statusIsError,
    error: statusError,
    refetch: refetchStatus,
  } = useWifiApStatus(deviceId!);
  const { data: clients, isLoading: clientsLoading, refetch: refetchClients, isError: clientsIsError } = useWifiClients(deviceId!);
  const { data: traffic, isLoading: trafficLoading, refetch: refetchTraffic } = useWifiTraffic(deviceId!);
  const {
    data: config,
    isLoading: configLoading,
    refetch: refetchConfig,
  } = useWifiConfig(deviceId!);

  const [prevTraffic, setPrevTraffic] = useState<WifiTraffic | undefined>();

  useEffect(() => {
    if (!traffic) return;
    const timeout = setTimeout(() => setPrevTraffic(traffic), 0);
    return () => clearTimeout(timeout);
  }, [traffic]);

  const isConnectivityError = statusIsError || clientsIsError;
  const connectivityMessage =
    statusError instanceof ApiError
      ? statusError.message
      : "Unable to reach the device";

  const handleRetryAll = () => {
    refetchStatus();
    refetchClients();
    refetchTraffic();
    refetchConfig();
  };

  if (isConnectivityError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <WifiOff className="w-16 h-16 text-muted-foreground mx-auto" />
          <div className="text-lg font-semibold">Device Unreachable</div>
          <div className="text-sm text-muted-foreground max-w-xs mx-auto">
            {connectivityMessage}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryAll}
            className="gap-2"
            aria-label="Retry connection"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <WifiOff className="w-16 h-16 text-muted-foreground mx-auto" />
          <div className="text-lg font-semibold text-muted-foreground">
            Device Not Supported
          </div>
          <div className="text-sm text-muted-foreground">
            This device does not support WiFi Access Point management
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WifiApStatusCard status={status} isLoading={statusLoading} />
        <WifiApTrafficCard
          traffic={traffic}
          prevTraffic={prevTraffic}
          isLoading={trafficLoading}
        />
      </div>
      <WifiApClientsTable clients={clients} isLoading={clientsLoading} onRefresh={refetchClients} />
      <WifiApConfigForm
        deviceId={deviceId!}
        config={config}
        isLoading={configLoading}
        onSuccess={() => refetchConfig()}
      />
    </div>
  );
};

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createUrl, joystickApi, streamApi } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  ServerCrash,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ServiceStatus = "healthy" | "degraded" | "offline" | "unknown";

interface SystemStatus {
  networkStatus: "online" | "offline";
  joystickApiStatus: ServiceStatus;
  streamApiStatus: ServiceStatus;
  pocketbaseStatus: ServiceStatus;
  switcherStatus: ServiceStatus;
  bakerStatus: ServiceStatus;
  panelStatus: ServiceStatus;
  whisperStatus: ServiceStatus;
  smsServerStatus: ServiceStatus;
  lastChecked: Date;
}

interface HealthResponse {
  status: string;
  message?: string;
  uptime?: number;
  version?: string;
  [key: string]: string | number | boolean | undefined;
}

const getStatusIcon = (status: ServiceStatus) => {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "degraded":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "offline":
      return <ServerCrash className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusLabel = (status: ServiceStatus) => {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "offline":
      return "Offline";
    default:
      return "Unknown";
  }
};

const getStatusColor = (status: ServiceStatus) => {
  switch (status) {
    case "healthy":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    case "offline":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

export function AppStatusIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    networkStatus: navigator.onLine ? "online" : "offline",
    joystickApiStatus: "unknown",
    streamApiStatus: "unknown",
    pocketbaseStatus: "unknown",
    switcherStatus: "unknown",
    bakerStatus: "unknown",
    panelStatus: "unknown",
    whisperStatus: "unknown",
    smsServerStatus: "unknown",
    lastChecked: new Date(),
  });

  // Query to check joystick API health
  const { data: joystickHealth, refetch: refetchJoystick } = useQuery({
    queryKey: ["health", "joystick"],
    queryFn: async () => {
      return joystickApi.get<HealthResponse>(
        createUrl(urls.joystick, "/api/health")
      );
    },
    retry: 1,
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: false,
    gcTime: 0, // Don't cache health check results
    staleTime: 55000, // Consider stale after 55 seconds
    // Prevent global error handler from showing errors for health checks
    meta: { suppressGlobalErrors: true },
  });

  const { data: switcherHealth, refetch: refetchSwitcher } = useQuery({
    queryKey: ["health", "switcher"],
    queryFn: async () => {
      return joystickApi.get<HealthResponse>(
        createUrl(urls.switcher, "/api/health")
      );
    },
    retry: 1,
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: false,
    gcTime: 0, // Don't cache health check results
    staleTime: 55000, // Consider stale after 55 seconds
    // Prevent global error handler from showing errors for health checks
    meta: { suppressGlobalErrors: true },
  });

  const { data: bakerHealth, refetch: refetchBaker } = useQuery({
    queryKey: ["health", "baker"],
    queryFn: async () => {
      return joystickApi.get<HealthResponse>(
        createUrl(urls.baker, "/api/health")
      );
    },
    retry: 1,
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: false,
    gcTime: 0, // Don't cache health check results
    staleTime: 55000, // Consider stale after 55 seconds
    // Prevent global error handler from showing errors for health checks
    meta: { suppressGlobalErrors: true },
  });

  const { data: panelHealth, refetch: refetchPanel } = useQuery({
    queryKey: ["health", "panel"],
    queryFn: async () => {
      return joystickApi.get<HealthResponse>(
        createUrl(urls.panel, "/api/health")
      );
    },
    retry: 1,
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: false,
    gcTime: 0, // Don't cache health check results
    staleTime: 55000, // Consider stale after 55 seconds
    // Prevent global error handler from showing errors for health checks
    meta: { suppressGlobalErrors: true },
  });

  const { data: whisperHealth, refetch: refetchWhisper } = useQuery({
    queryKey: ["health", "whisper"],
    queryFn: async () => {
      return joystickApi.get<HealthResponse>(
        createUrl(urls.whisper, "/api/health")
      );
    },
    retry: 1,
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: false,
    gcTime: 0, // Don't cache health check results
    staleTime: 55000, // Consider stale after 55 seconds
    // Prevent global error handler from showing errors for health checks
    meta: { suppressGlobalErrors: true },
  });

  const { data: smsServerHealth, refetch: refetchSmsServer } = useQuery({
    queryKey: ["health", "sms-server"],
    queryFn: async () => {
      return joystickApi.get<HealthResponse>(
        createUrl(urls.whisper, "/api/health/sms")
      );
    },
    retry: 1,
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: false,
    gcTime: 0, // Don't cache health check results
    staleTime: 55000, // Consider stale after 55 seconds
    // Prevent global error handler from showing errors for health checks
    meta: { suppressGlobalErrors: true },
  });

  // Query to check stream API health
  const { data: streamHealth, refetch: refetchStream } = useQuery({
    queryKey: ["health", "stream"],
    queryFn: async () => {
      await streamApi.get(createUrl(urls.stream_api, "/v3/paths/list"));

      return {
        status: "healthy",
        message: "Stream API is healthy",
      };
    },
    retry: 1,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    gcTime: 0,
    staleTime: 55000,
    meta: { suppressGlobalErrors: true },
  });

  // Query to check PocketBase health
  const { data: pocketbaseHealth, refetch: refetchPocketbase } = useQuery({
    queryKey: ["health", "pocketbase"],
    queryFn: async () => {
      const response = await fetch(createUrl(urls.pocketbase, "/api/health"), {
        method: "GET",
      });

      if (!response.ok) throw new Error("PocketBase health check failed");
      const data = await response.json();

      return {
        status: "healthy",
        message: data.message,
      } as HealthResponse;
    },
    retry: 1,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    gcTime: 0,
    staleTime: 55000,
    meta: { suppressGlobalErrors: true },
  });

  // Refreshes all health checks - define this function first to avoid the "used before declaration" error
  const refreshAllHealthChecks = useCallback(() => {
    refetchJoystick();
    refetchSwitcher();
    refetchBaker();
    refetchPanel();
    refetchStream();
    refetchWhisper();
    refetchSmsServer();
    refetchPocketbase();

    // Invalidate queries that might be dependent on service availability
    queryClient.invalidateQueries({ queryKey: ["devices"] });
    queryClient.invalidateQueries({ queryKey: ["cameras"] });
  }, [
    refetchJoystick,
    refetchSwitcher,
    refetchBaker,
    refetchPanel,
    refetchStream,
    refetchWhisper,
    refetchSmsServer,
    refetchPocketbase,
    queryClient,
  ]); // Add dependencies here

  // Update system status whenever health data changes
  useEffect(() => {
    setSystemStatus((prev) => ({
      ...prev,
      joystickApiStatus:
        joystickHealth?.status === "healthy" ? "healthy" : "offline",
      streamApiStatus:
        streamHealth?.status === "healthy" ? "healthy" : "offline",
      pocketbaseStatus:
        pocketbaseHealth?.status === "healthy" ? "healthy" : "offline",
      switcherStatus:
        switcherHealth?.status === "healthy" ? "healthy" : "offline",
      bakerStatus: bakerHealth?.status === "healthy" ? "healthy" : "offline",
      panelStatus: panelHealth?.status === "healthy" ? "healthy" : "offline",
      whisperStatus:
        whisperHealth?.status === "healthy" ? "healthy" : "offline",
      smsServerStatus:
        smsServerHealth?.status === "healthy" ? "healthy" : "offline",
      lastChecked: new Date(),
    }));
  }, [
    joystickHealth,
    streamHealth,
    pocketbaseHealth,
    switcherHealth,
    bakerHealth,
    panelHealth,
    whisperHealth,
    smsServerHealth,
  ]);

  // Update network status on online/offline events
  // We need to keep this useEffect for browser events
  useEffect(() => {
    const handleOnline = () => {
      setSystemStatus((prev) => ({ ...prev, networkStatus: "online" }));
      refreshAllHealthChecks();
    };

    const handleOffline = () => {
      setSystemStatus((prev) => ({ ...prev, networkStatus: "offline" }));
    };

    const handleReconnect = () => {
      refreshAllHealthChecks();
    };

    // Combine all event listeners in a single useEffect
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("network:reconnected", handleReconnect);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("network:reconnected", handleReconnect);
    };
  }, [refreshAllHealthChecks]);

  // Calculate overall system status
  const overallStatus = (): ServiceStatus => {
    if (systemStatus.networkStatus === "offline") return "offline";

    const services = [
      systemStatus.joystickApiStatus,
      systemStatus.streamApiStatus,
      systemStatus.pocketbaseStatus,
      systemStatus.switcherStatus,
      systemStatus.bakerStatus,
      systemStatus.panelStatus,
      systemStatus.whisperStatus,
      systemStatus.smsServerStatus,
    ];

    if (services.some((s) => s === "offline")) return "degraded";
    if (services.every((s) => s === "healthy")) return "healthy";

    return "degraded";
  };

  const currentStatus = overallStatus();

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 items-center justify-center rounded-full shadow-m"
              onClick={() => setIsOpen(true)}
            >
              <div
                className={cn(
                  "absolute h-3 w-3 rounded-full",
                  getStatusColor(currentStatus)
                )}
              />
              <div
                className={cn(
                  "absolute h-3 w-3 rounded-full animate-ping",
                  getStatusColor(currentStatus),
                  "opacity-75"
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>System Status: {getStatusLabel(currentStatus)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-none">
          <DialogHeader>
            <DialogTitle>System Status</DialogTitle>
            <DialogDescription>
              Current status of application services
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Network Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {systemStatus.networkStatus === "online" ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>Network Connectivity</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.networkStatus === "online"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {systemStatus.networkStatus === "online"
                    ? "Online"
                    : "Offline"}
                </span>
              </div>
            </div>

            {/* Joystick API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.joystickApiStatus)}
                <span>Joystick API</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.joystickApiStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.joystickApiStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.joystickApiStatus)}
                </span>
              </div>
            </div>

            {/* Switcher API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.switcherStatus)}
                <span>Switcher API</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.switcherStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.switcherStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.switcherStatus)}
                </span>
              </div>
            </div>

            {/* Baker API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.bakerStatus)}
                <span>Baker API</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.bakerStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.bakerStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.bakerStatus)}
                </span>
              </div>
            </div>

            {/* Panel API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.panelStatus)}
                <span>Panel API</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.panelStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.panelStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.panelStatus)}
                </span>
              </div>
            </div>

            {/* Whisper API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.whisperStatus)}
                <span>Whisper API</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.whisperStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.whisperStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.whisperStatus)}
                </span>
              </div>
            </div>

            {/* SMS Server Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.smsServerStatus)}
                <span>SMS Server</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.smsServerStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.smsServerStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.smsServerStatus)}
                </span>
              </div>
            </div>

            {/* Stream API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.streamApiStatus)}
                <span>Stream API</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.streamApiStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.streamApiStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.streamApiStatus)}
                </span>
              </div>
            </div>

            {/* Database Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database
                  className={cn(
                    "h-4 w-4",
                    systemStatus.pocketbaseStatus === "healthy"
                      ? "text-green-500"
                      : systemStatus.pocketbaseStatus === "degraded"
                      ? "text-yellow-500"
                      : "text-red-500"
                  )}
                />
                <span>Database</span>
              </div>
              <div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    systemStatus.pocketbaseStatus === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : systemStatus.pocketbaseStatus === "degraded"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}
                >
                  {getStatusLabel(systemStatus.pocketbaseStatus)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Last updated: {systemStatus.lastChecked.toLocaleTimeString()}
              </span>

              <Button
                size="sm"
                onClick={() => {
                  refreshAllHealthChecks();
                  toast.success({ message: "Refreshing system status..." });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { urls } from "@/lib/urls";
import { createUrl, joystickApi } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

interface PingResult {
  success: boolean;
  timestamp: number;
  responseTime?: number;
  error?: string;
}

export function usePing(
  deviceId: string,
  enabled: boolean = false,
  tabActive: boolean = true
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ping", deviceId],
    queryFn: async (): Promise<PingResult> => {
      const startTime = Date.now();
      try {
        const url = createUrl(urls.joystick, `/api/ping/${deviceId}`);
        const result = await joystickApi.get<boolean>(url);
        const endTime = Date.now();

        return {
          success: result,
          timestamp: endTime,
          responseTime: endTime - startTime,
        };
      } catch (error) {
        const endTime = Date.now();
        return {
          success: false,
          timestamp: endTime,
          responseTime: endTime - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    enabled: enabled && tabActive && !!deviceId,
    refetchInterval: enabled && tabActive ? 1000 : false,
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0,
  });

  return {
    pingResult: data,
    isLoading,
    error,
    refetch,
  };
}

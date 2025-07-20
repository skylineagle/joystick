import { runAction } from "@/lib/joystick-api";
import { useQuery } from "@tanstack/react-query";

interface TemperatureData {
  temperature: number;
  unit: string;
}

export const useDeviceTemperature = (
  deviceId: string,
  isSupported?: boolean,
  isPermitted?: boolean,
  onDataFetched?: () => void
) => {
  return useQuery({
    queryKey: ["device-temp", deviceId],
    queryFn: async (): Promise<TemperatureData | null> => {
      try {
        const data = await runAction({
          deviceId,
          action: "get-temp",
          params: {},
          timeout: 10000,
        });

        if (typeof data === "string") {
          const parsed = JSON.parse(data);
          const result = {
            temperature: parsed.temperature || parsed.temp || Number(data) || 0,
            unit: parsed.unit || "°C",
          };
          onDataFetched?.();

          return result;
        }

        return null;
      } catch (error) {
        console.error("Error fetching temperature:", error);
        return null;
      }
    },
    enabled: !!deviceId && !!isSupported && !!isPermitted,
    refetchInterval: 30000,
  });
};

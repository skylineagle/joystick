import { useIsSupported } from "@/hooks/use-is-supported";
import { urls } from "@/lib/urls";
import { useQuery } from "@tanstack/react-query";

export function useDeviceMode(deviceId: string) {
  const isSupported = useIsSupported(deviceId, "get-mode");
  return useQuery({
    queryKey: ["device-mode", deviceId],
    queryFn: async () => {
      const response = await fetch(
        `${urls.joystick}/api/run/${deviceId}/get-mode`
      );
      const data = await response.json();
      console.log(`device mode: ${data}`);

      return data;
    },
    enabled: isSupported,
  });
}

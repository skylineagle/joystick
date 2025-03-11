import { fetchDevice } from "@/lib/device";
import { useQuery } from "@tanstack/react-query";

export function useDevice(deviceId?: string) {
  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      if (!deviceId || deviceId === "") return null;

      const device = await fetchDevice(deviceId);
      return device;
    },
    enabled: !!deviceId,
  });
}

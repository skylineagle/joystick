import { useQuery } from "@tanstack/react-query";
import { fetchDevice } from "@/lib/device";

export function useDevice(deviceId: string) {
  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: () => fetchDevice(deviceId),
  });
}

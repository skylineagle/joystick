import { fetchDevice } from "@/lib/device";
import { pb } from "@/lib/pocketbase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useDevice(deviceId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!deviceId) return;

    pb.collection("devices").subscribe(deviceId, (e) => {
      if (e.record.id === deviceId) {
        queryClient.invalidateQueries({ queryKey: ["device", e.record.id] });
      }
    });

    return () => {
      if (deviceId) pb.collection("devices").unsubscribe(deviceId);
    };
  }, [deviceId, queryClient]);

  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      if (!deviceId) return null;

      const device = await fetchDevice(deviceId);
      return device;
    },
    enabled: !!deviceId,
  });
}

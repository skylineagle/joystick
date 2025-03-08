import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDevice } from "@/lib/device";
import { useEffect } from "react";
import { pb } from "@/lib/pocketbase";

export function useDevice(deviceId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    pb.collection("devices").subscribe(deviceId ?? "", (e) => {
      if (e.record.id === deviceId) {
        queryClient.invalidateQueries({ queryKey: ["device", e.record.id] });
      }
    });

    return () => {
      pb.collection("devices").unsubscribe(deviceId ?? "");
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

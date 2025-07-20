import { pb } from "@/lib/pocketbase";
import type { DeviceResponse, ModelResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export const useDeviceModel = (deviceId: string) => {
  return useQuery({
    queryKey: ["device-model", deviceId],
    queryFn: async (): Promise<ModelResponse | null> => {
      if (!deviceId) return null;

      try {
        const devices = await pb
          .collection("devices")
          .getFullList<DeviceResponse>({
            filter: `id = "${deviceId}"`,
            expand: "device",
          });

        if (!devices[0]?.expand?.device) {
          return null;
        }

        return devices[0].expand.device;
      } catch (error) {
        console.error("Error fetching device model:", error);
        return null;
      }
    },
    enabled: !!deviceId,
  });
};

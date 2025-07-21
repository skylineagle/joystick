import { pb } from "@/lib/pocketbase";
import { useQuery } from "@tanstack/react-query";
import { DeviceResponse } from "@/types/types";

export type MessagePreset = {
  id: string;
  name: string;
  message: string;
};

export const useMessagePresets = (deviceId: string) => {
  return useQuery({
    queryKey: ["message-presets", deviceId],
    queryFn: async (): Promise<MessagePreset[]> => {
      if (!deviceId) return [];

      try {
        const devices = await pb.collection("devices").getFullList<DeviceResponse>({
          filter: `id = "${deviceId}"`,
          expand: "device",
        });

        if (!devices[0]?.expand?.device) {
          return [];
        }

        const model = devices[0].expand.device;
        const presets = model.message_persets || [];

        return Array.isArray(presets) ? presets : [];
      } catch (error) {
        console.error("Error fetching message presets:", error);
        return [];
      }
    },
    enabled: !!deviceId,
  });
};

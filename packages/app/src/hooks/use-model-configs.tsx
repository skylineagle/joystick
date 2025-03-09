import { modeConfig } from "@/components/device/consts";
import { pb } from "@/lib/pocketbase";
import { DeviceResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useModeConfig(deviceId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["model-configs", deviceId],
    queryFn: async () => {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>({
          filter: `id = "${deviceId}"`,
          expand: "device",
        });

      if (!devices[0]) {
        return modeConfig;
      }

      const device = devices[0];
      const res = Object.entries(
        device.expand?.device?.mode_configs ?? {}
      ).reduce((acc, [mode, config]) => {
        return {
          ...acc,
          [mode]: config,
        };
      }, modeConfig);

      return res;
    },
    enabled: !!deviceId,
  });

  return { data: data ?? modeConfig, isLoading };
}

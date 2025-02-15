import { useQuery } from "@tanstack/react-query";
import { useDevice } from "./use-device";
import { fetchDeviceActions } from "@/lib/device";

export function useIsSupported(deviceId: string, actions: string | string[]) {
  const { data: device } = useDevice(deviceId);
  const { data: deviceActions } = useQuery({
    queryKey: ["device-actions", deviceId],
    queryFn: () => fetchDeviceActions(device),
    enabled: !!device,
  });

  return typeof actions === "string"
    ? deviceActions?.includes(actions)
    : actions.every((action) => deviceActions?.includes(action));
}

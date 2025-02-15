import { useQuery } from "@tanstack/react-query";
import { useDevice } from "./use-device";
import { fetchDeviceActions } from "@/lib/device";

export function useIsParamsSupported(deviceId: string) {
  const { data: device } = useDevice(deviceId);
  const { data: actions } = useQuery({
    queryKey: ["device-actions", deviceId],
    queryFn: () => fetchDeviceActions(device),
    enabled: !!device,
  });

  console.log(actions);

  return (
    device?.expand?.device.params &&
    actions?.includes("read") &&
    actions?.includes("write")
  );
}

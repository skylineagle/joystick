import { useDevice } from "@/hooks/use-device";
import { useDeviceActions } from "@/hooks/use-device-actions";

export function useIsParamsSupported(deviceId: string) {
  const { data: device } = useDevice(deviceId);
  const { data: actions } = useDeviceActions(device?.expand?.device.id);

  return actions?.includes("read") && actions?.includes("write");
}

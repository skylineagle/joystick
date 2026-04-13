import { useDevice } from "@/hooks/use-device";
import { useDeviceActions } from "@/hooks/use-device-actions";

export function useIsWifiApSupported(deviceId: string) {
  const { data: device } = useDevice(deviceId);
  const { data: actions } = useDeviceActions(device?.expand?.device.id);
  return !!actions?.includes("get-wifi-ap-status");
}

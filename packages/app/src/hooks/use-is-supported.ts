import { useDevice } from "@/hooks/use-device";
import { useDeviceActions } from "@/hooks/use-device-actions";

export function useIsSupported(deviceId: string, actions: string | string[]) {
  const { data: device } = useDevice(deviceId);
  const { data: deviceActions, isLoading } = useDeviceActions(
    device?.expand?.device.id
  );

  return {
    isSupported:
      typeof actions === "string"
        ? deviceActions?.includes(actions)
        : actions.every((action) => deviceActions?.includes(action)),
    isLoading,
  };
}

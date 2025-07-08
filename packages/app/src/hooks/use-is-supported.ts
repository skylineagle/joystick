import { useDevice } from "@/hooks/use-device";
import { useDeviceActions } from "@/hooks/use-device-actions";
import { useMemo } from "react";

export function useIsSupported(
  deviceId: string,
  actions: string | string[],
  filter?: "all" | "any"
) {
  const { data: device } = useDevice(deviceId);
  const { data: deviceActions, isLoading } = useDeviceActions(
    device?.expand?.device.id
  );

  const isSupported = useMemo(() => {
    if (!deviceActions) return false;

    if (typeof actions === "string") {
      return deviceActions.includes(actions);
    }

    if (filter === "any") {
      return actions.some((action) => deviceActions.includes(action));
    }

    return actions.every((action) => deviceActions.includes(action));
  }, [actions, deviceActions, filter]);

  return {
    isSupported,
    isLoading,
  };
}

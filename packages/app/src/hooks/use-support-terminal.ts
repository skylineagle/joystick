import { useDevice } from "@/hooks/use-device";
import { getActiveDeviceConnection } from "@/utils/device";

export function useIsTerminalSupported(deviceId: string) {
  const { data: device } = useDevice(deviceId);

  if (!device?.information) {
    return false;
  }

  const { host: activeHost } = getActiveDeviceConnection(device.information);

  return activeHost && device.information.user;
}

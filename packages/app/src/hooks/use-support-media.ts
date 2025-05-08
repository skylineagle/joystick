import { useDevice } from "@/hooks/use-device";

export function useIsMediaSupported(deviceId: string) {
  const { data: device } = useDevice(deviceId);

  return device?.expand?.device.stream !== "none";
}

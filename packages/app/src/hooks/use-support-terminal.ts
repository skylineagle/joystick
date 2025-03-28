import { useDevice } from "@/hooks/use-device";

export function useIsTerminalSupported(deviceId: string) {
  const { data: device } = useDevice(deviceId);

  return device?.information?.host && device?.information?.user;
}

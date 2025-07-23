import { useDevice } from "@/hooks/use-device";

export const useIsAudioSupported = (deviceId: string) => {
  const { data: device } = useDevice(deviceId);

  if (!device?.expand?.device) {
    return false;
  }

  return device.expand.device.isAudio === true;
};

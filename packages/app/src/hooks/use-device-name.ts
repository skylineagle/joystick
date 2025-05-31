import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useMemo } from "react";

export const useDeviceName = (deviceId?: string) => {
  const { devices } = useDevicesQuery();

  const deviceName = useMemo(() => {
    if (!deviceId) return null;

    const device = devices?.find((d) => d.id === deviceId);
    return device?.name || deviceId;
  }, [deviceId, devices]);

  return deviceName;
};

export const useDeviceNameMap = () => {
  const { devices } = useDevicesQuery();

  const deviceNameMap = useMemo(() => {
    if (!devices) return new Map<string, string>();

    return new Map(devices.map((device) => [device.id, device.name]));
  }, [devices]);

  return deviceNameMap;
};

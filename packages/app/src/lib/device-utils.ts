import type { Option } from "@/components/ui/multiselect";
import type { DeviceResponse } from "@/types/types";

export function devicesToOptions(
  devices: DeviceResponse[] | undefined
): Option[] {
  if (!devices) return [];
  return devices.map((device) => ({
    value: device.id,
    label: device.name || device.id,
  }));
}

export function deviceIdsToOptions(
  deviceIds: string[],
  devices: DeviceResponse[] | undefined
): Option[] {
  if (!devices) return [];
  return deviceIds
    .map((id) => {
      const device = devices.find((d) => d.id === id);
      if (!device) return null;
      return {
        value: device.id,
        label: device.name || device.id,
      };
    })
    .filter((option): option is Option => option !== null);
}

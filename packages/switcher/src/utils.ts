import type { DeviceResponse } from "@joystick/core";
import type { DeviceInformation } from "@joystick/core";

export function getDeviceHost(
  device: DeviceResponse,
  slot: DeviceInformation["activeSlot"]
) {
  return slot === "primary"
    ? device.information?.host
    : device.information?.secondSlotHost;
}

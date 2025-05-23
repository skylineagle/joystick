import type { DeviceInformation } from "@/types";

/**
 * Retrieves the active host and phone number for a device based on its activeSlot.
 *
 * @param deviceInfo - The device information object.
 * @returns An object containing the active host and phone number.
 *          Returns primary host/phone if activeSlot is not 'secondary' or if secondary details are missing.
 */
export const getActiveDeviceConnection = (
  deviceInfo: DeviceInformation
): { host: string; phone?: string } => {
  if (deviceInfo.activeSlot === "secondary" && deviceInfo.secondSlotHost) {
    return {
      host: deviceInfo.secondSlotHost,
      phone: deviceInfo.secondSlotPhone,
    };
  }
  return {
    host: deviceInfo.host,
    phone: deviceInfo.phone,
  };
};

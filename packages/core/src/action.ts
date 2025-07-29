import { STREAM_API_URL, SWITCHER_API_URL } from "@/config";
import type { DeviceResponse } from "@/types";

export function parseActionCommand(
  device: DeviceResponse,
  action: string,
  params?: Record<string, unknown>,
  auth?: { userId: string }
) {
  const defaultParameters = {
    device: device.id,
    mediamtx: STREAM_API_URL,
    switcher: SWITCHER_API_URL,
    userId: auth?.userId,
    ...device.information,
  };

  const command = Object.entries({
    ...defaultParameters,
    ...params,
  }).reduce((acc, [key, value]) => {
    if (acc.includes(`$${key}`)) {
      return acc.replaceAll(`$${key}`, String(value));
    }
    return acc;
  }, action);

  return command;
}

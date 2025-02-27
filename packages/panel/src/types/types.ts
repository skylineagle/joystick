import type { DevicesResponse as BaseDevicesResponse, ModelsResponse } from "./db.types";

export interface CameraAutomation {
  minutesOn: number;
  minutesOff: number;
}

export interface DeviceConfiguration {
  name: string;
  source: string;
}

export interface DeviceInfo {
  host: string;
  user: string;
  password: string;
}

export type DevicesResponse = Omit<
  BaseDevicesResponse<DeviceConfiguration, DeviceInfo, { device: ModelsResponse }>,
  "created" | "updated"
>;

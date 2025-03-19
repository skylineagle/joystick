import type {
  DevicesResponse as BaseDevicesResponse,
  ModelsResponse,
} from "./db.types";
import type { DevicesResponse } from "@/types/db.types";

export type DeviceAutomation = {
  automationType: "duration" | "timeOfDay";
  on: {
    minutes?: number;
    mode: string;
    hourOfDay?: number;
    minuteOfDay?: number;
  };
  off: {
    minutes?: number;
    mode: string;
    hourOfDay?: number;
    minuteOfDay?: number;
  };
};

export type DeviceConfiguration = {
  name: string;
  source: string;
} & { [key: string]: unknown };

export type DeviceInformation = {
  user: string;
  password: string;
  host: string;
  phone?: string;
  battery_capacity?: number;
};

export type DeviceResponse = DevicesResponse<
  DeviceAutomation,
  DeviceConfiguration,
  DeviceInformation,
  { device: ModelsResponse }
>;

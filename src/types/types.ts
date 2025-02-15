import { DevicesResponse, ModelsResponse } from "@/types/db.types";
export type DeviceConfiguration = {
  user: string;
  password: string;
  host: string;
};

export type DeviceWithModel = DevicesResponse<
  DeviceConfiguration,
  { device: ModelsResponse }
>;
export type FullDevice = DevicesResponse<
  DeviceConfiguration,
  { device: ModelsResponse }
>;

export interface ActionSchema {
  name: string;
  description?: string;
  params?: Record<string, unknown>; // JSON Schema for parameters
}

export interface ActionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

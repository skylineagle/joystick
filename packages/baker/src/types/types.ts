import type { DevicesResponse, ModelsResponse } from "@/types/db.types";

export type DeviceAutomation = {
  minutesOn: number;
  minutesOff: number;
};

export type DeviceConfiguration = {
  name: string;
  source: string;
} & { [key: string]: unknown };

export type DeviceInformation = {
  user: string;
  password: string;
  host: string;
};

export type DeviceResponse = DevicesResponse<
  DeviceAutomation,
  DeviceConfiguration,
  DeviceInformation,
  { device: ModelsResponse }
>;

export interface ParamValue {
  type: "string" | "number" | "boolean" | "integer";
  title: string;
  description?: string;
  minimum?: number;
  maximum?: number;
  enum?: string[] | number[];
}

export interface ParamNode {
  type: "object";
  title: string;
  description?: string;
  properties: Record<string, ParamNode | ParamValue>;
}

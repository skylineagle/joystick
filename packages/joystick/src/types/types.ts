import type { DevicesResponse, ModelsResponse } from "@/types/db.types";

export type CPSIResult = {
  technology: string;
  status: string;
  operator?: string;
  mccMnc?: string;
  band?: string;
  arfcn?: number;
  rxChannel?: number;
  rssi?: number;
  rsrp?: number;
  sinr?: number;
  rsrq?: number;
  bsic?: number;
  timingAdvance?: number;
};

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

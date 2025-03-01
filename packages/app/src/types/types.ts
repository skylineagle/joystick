import {
  ActionsResponse,
  RunResponse as BaseRunResponse,
  DevicesResponse,
  ModelsResponse,
  RulesResponse,
  UsersResponse,
} from "@/types/db.types";

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

export type RuleResponse = RulesResponse & {
  expand: {
    allow: UsersResponse;
    action: ActionsResponse[];
  };
};

export type DeviceAutomation = {
  on: {
    minutes: number;
    mode: string;
  };
  off: {
    minutes: number;
    mode: string;
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
};

export type DeviceResponse = DevicesResponse<
  DeviceAutomation,
  DeviceConfiguration,
  DeviceInformation,
  { device: ModelsResponse }
>;

export type InsertDevice = Omit<DevicesResponse, "id" | "created" | "updated">;
export type UpdateDevice = Partial<InsertDevice> & { id: string };

export interface ActionSchema {
  name: string;
  description?: string;
  params?: Record<string, unknown>; // JSON Schema for parameters
}

export type ActionResponse = ActionsResponse;

export type RunResponse = BaseRunResponse<
  Record<string, unknown>,
  {
    device: ModelsResponse;
    action: ActionsResponse;
  }
>;

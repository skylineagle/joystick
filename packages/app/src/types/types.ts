import {
  ActionLogsResponse as BaseActionLogsResponse,
  ActionsResponse,
  RunResponse as BaseRunResponse,
  DevicesResponse,
  ModelsResponse,
  RulesResponse,
  UsersResponse,
  ParametersTreeResponse,
} from "@/types/db.types";

export type ModelStreamQulity = {
  [key: string]: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
};

export type ModelModeConfigs = {
  [key: string]: {
    label: string;
    icon: string;
    description: string;
    color: string;
    bgColor: string;
    hoverColor: string;
  };
};

export type ModelResponse = ModelsResponse<
  ModelModeConfigs,
  unknown,
  ModelStreamQulity
>;

export type CPSIResult = {
  technology: string;
  status: string;
  cellId?: string;
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
  automationType: "duration" | "timeOfDay";
  on: {
    minutes?: number;
    mode: string;
    utcDate?: string;
  };
  off: {
    minutes?: number;
    mode: string;
    utcDate?: string;
  };
};

export type DeviceConfiguration = {
  name: string;
  source: string;
} & { [key: string]: unknown };

export type DeviceInformation = {
  user: string;
  password: string;
  key: string;
  host: string;
  phone?: string;
  battery_capacity?: number;
  aspectRatio?: string;
  imuResetValues?: {
    x: number;
    y: number;
    z: number;
  };
  bitrate_presets?: {
    [key: string]: number;
  };
  fps_presets?: {
    [key: string]: number;
  };
  quality_presets?: {
    [key: string]: {
      bitrate: number;
      fps: number;
    };
  };
};

export type DeviceResponse = DevicesResponse<
  DeviceAutomation,
  DeviceConfiguration,
  DeviceInformation,
  { device: ModelResponse }
>;

export type InsertDevice = Omit<
  DevicesResponse,
  "id" | "created" | "updated" | "overlay"
>;
export type UpdateDevice = Partial<InsertDevice> & {
  id: string;
  overlay?: File;
};

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

export type ActionLogsResponse = BaseActionLogsResponse<
  Record<string, unknown>,
  { output?: string; error?: string; success: boolean },
  {
    action: ActionsResponse;
    device: ModelsResponse;
    user: UsersResponse;
  }
>;

export type ParametersTree = ParametersTreeResponse & {
  expand: {
    read: ActionsResponse;
    write: ActionsResponse;
  };
};

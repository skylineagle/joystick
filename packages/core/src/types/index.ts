import type {
  ActionsResponse,
  ActionLogsResponse as BaseActionLogsResponse,
  RunResponse as BaseRunResponse,
  DevicesResponse,
  ModelsResponse,
  NotificationsResponse,
  ParametersTreeResponse,
  RulesResponse,
  TerminalSessionsResponse,
  UsersResponse,
} from "@/types/db.types";

export * from "./db.types";

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

export type TemperatureLevel = {
  min: number;
  max: number;
  color: string;
  status: string;
};

export type TempLevelPresets = {
  cool: TemperatureLevel;
  normal: TemperatureLevel;
  warm: TemperatureLevel;
  hot: TemperatureLevel;
};

export type ModelResponse = ModelsResponse<
  ModelModeConfigs,
  unknown,
  ModelStreamQulity,
  TempLevelPresets
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
  port?: number;
  phone?: string;
  secondSlotHost?: string;
  secondSlotPhone?: string;
  activeSlot?: "primary" | "secondary";
  autoSlotSwitch?: boolean;
  battery_capacity?: number;
  battery_factor?: number;
  aspectRatio?: string;
  harvest: {
    interval?: number;
    supportedTypes?: string[];
    autoPull?: boolean;
  };
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
  scan?: {
    data: Array<{
      id: string;
      operator: string;
      operatorId: string;
      tech: string;
      arfcn: number;
      band: string;
      frequency: number;
      pci: number;
      tac: number;
      cellIdHex: string;
      cellIdDec: string;
      rsrp: number;
      rsrq: number;
    }>;
    timestamp: string;
  };
  cellInfo?: {
    data: CPSIResult;
    timestamp: string;
  };
};

export type DeviceResponse = DevicesResponse<
  DeviceAutomation,
  DeviceConfiguration,
  DeviceInformation,
  { device: ModelResponse }
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

export type Notification = NotificationsResponse<Record<string, unknown>>;

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "emergency";

export type SendNotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  deviceId?: string;
  dismissible?: boolean;
  metadata?: Record<string, unknown>;
};

export type TerminalSession = TerminalSessionsResponse<
  Record<string, unknown>,
  { user: UsersResponse; device: DevicesResponse }
>;

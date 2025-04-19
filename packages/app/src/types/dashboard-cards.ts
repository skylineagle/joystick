import { ParamValue } from "./params";

export enum CardType {
  STREAM_VIEW = "stream_view",
  BATTERY_STATUS = "battery_status",
  CELL_STATUS = "cell_status",
  LOCATION = "location",
  IMU_STATUS = "imu_status",
  ACTION_RUNNER = "action_runner",
  PARAM_VALUE_EDITOR = "param_value_editor",
}

// Base configuration interface that all card configs must extend
export interface BaseCardConfig {
  id: string;
  type: CardType;
  title?: string;
}

// Stream view card configuration
export interface StreamViewCardConfig extends BaseCardConfig {
  type: CardType.STREAM_VIEW;
  deviceId: string;
}

// Battery status card configuration
export interface BatteryStatusCardConfig extends BaseCardConfig {
  type: CardType.BATTERY_STATUS;
  deviceId: string;
}

// Cell status card configuration
export interface CellStatusCardConfig extends BaseCardConfig {
  type: CardType.CELL_STATUS;
  deviceId: string;
}

// Location card configuration
export interface LocationCardConfig extends BaseCardConfig {
  type: CardType.LOCATION;
  deviceIds: string[]; // Supports multiple devices
}

// IMU status card configuration
export interface IMUStatusCardConfig extends BaseCardConfig {
  type: CardType.IMU_STATUS;
  deviceId: string;
}

// Action runner card configuration
export interface ActionRunnerCardConfig extends BaseCardConfig {
  type: CardType.ACTION_RUNNER;
  deviceId: string;
  actionId?: string;
}

// Parameter value editor card configuration
export interface ParamValueEditorCardConfig extends BaseCardConfig {
  type: CardType.PARAM_VALUE_EDITOR;
  deviceId: string;
  paramKey: string;
  paramConfig: ParamValue;
}

// Union type of all possible card configurations
export type CardConfig =
  | StreamViewCardConfig
  | BatteryStatusCardConfig
  | CellStatusCardConfig
  | LocationCardConfig
  | IMUStatusCardConfig
  | ActionRunnerCardConfig
  | ParamValueEditorCardConfig;

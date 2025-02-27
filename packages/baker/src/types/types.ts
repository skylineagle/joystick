import type { CamerasResponse as BaseCameraResponse } from "./db.types";

export interface CameraAutomation {
  minutesOn: number;
  minutesOff: number;
}

export interface CameraConfiguration {
  name: string;
  source: string;
}

export interface CameraInfo {
  host: string;
  user: string;
  password: string;
}

export type CamerasResponse = Omit<
  BaseCameraResponse<CameraAutomation, CameraConfiguration, CameraInfo>,
  "created" | "updated"
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

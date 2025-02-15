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

export interface DeviceValue<T = unknown> {
  current: T | null; // Current value on the device
  edited: T | null; // New value edited by user (null means no edits)
  pending: T | null; // Value being written to device (null means no pending write)
  isLoading: boolean; // Whether the value is being read or written
  error?: string; // Error message if any operation failed
}

export type ParamPath = string[]; // Path to a parameter in the tree

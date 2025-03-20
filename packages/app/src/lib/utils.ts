import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CPSIResult } from "@/types/types";
import { CommittedRoiProperties } from "react-roi";
import { v4 as uuidv4 } from "uuid";
import { ParamPath } from "@/types/params";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseCPSIResult(input: string): CPSIResult | null {
  const match = input.match(/\+CPSI: (.*)/);
  if (!match) return null;

  const parts = match[1].split(",");
  const technology = parts[0]?.trim();
  const status = parts[1]?.trim();

  if (!technology || !status) return null;

  const result: CPSIResult = { technology, status };

  switch (technology) {
    case "LTE":
      if (parts.length >= 11) {
        result.operator = parts[2]?.trim();
        result.cellId = parts[3]?.trim();
        result.mccMnc = parts[3]?.trim();
        result.band = parts[4]?.trim();
        result.arfcn = parseInt(parts[5], 10);
        result.rxChannel = parseInt(parts[6], 10);
        result.rssi = parseInt(parts[7], 10);
        result.rsrp = parseInt(parts[8], 10);
        result.sinr = parseInt(parts[9], 10);
        result.rsrq = parseInt(parts[10], 10);
      }
      break;

    case "GSM":
      if (parts.length >= 8) {
        result.operator = parts[2]?.trim();
        result.mccMnc = parts[3]?.trim();
        result.band = parts[4]?.trim();
        result.arfcn = parseInt(parts[5], 10);
        result.bsic = parseInt(parts[6], 10);
        result.rssi = parseInt(parts[7], 10);
        if (parts[8]) result.timingAdvance = parseInt(parts[8], 10);
      }
      break;

    case "WCDMA":
      if (parts.length >= 8) {
        result.operator = parts[2]?.trim();
        result.mccMnc = parts[3]?.trim();
        result.band = parts[4]?.trim();
        result.arfcn = parseInt(parts[5], 10);
        result.rxChannel = parseInt(parts[6], 10);
        result.rssi = parseInt(parts[7], 10);
        if (parts[8]) result.rsrq = parseInt(parts[8], 10);
      }
      break;

    default:
      return null;
  }

  return result;
}

/**
 * Extracts mode enum options from a JSON schema
 * @param schema - JSON schema containing a mode field with enum values
 * @returns Array of mode options or empty array if not found
 */
export function getModeOptionsFromSchema(
  schema?: Record<string, unknown>
): string[] {
  if (!schema || typeof schema !== "object") return [];

  // Check if mode field exists directly in the schema
  if (
    schema.properties &&
    typeof schema.properties === "object" &&
    "mode" in schema.properties &&
    typeof schema.properties.mode === "object" &&
    schema.properties.mode !== null &&
    "enum" in schema.properties.mode &&
    Array.isArray(schema.properties.mode.enum)
  ) {
    return schema.properties.mode.enum as string[];
  }
  // Check if mode is directly in the schema
  if (
    schema.mode &&
    typeof schema.mode === "object" &&
    schema.mode !== null &&
    "enum" in schema.mode &&
    Array.isArray((schema.mode as Record<string, unknown>).enum)
  ) {
    return (schema.mode as Record<string, unknown>).enum as string[];
  }

  return [];
}

/**
 * Transforms coordinates into a CommittedRoiProperties object
 * @param coordinates - Object containing x1, x2, y1, y2 coordinates
 * @returns CommittedRoiProperties object
 */
export function transformToCommittedRoiProperties(coordinates: {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}): CommittedRoiProperties {
  return {
    id: uuidv4(),
    x: Math.min(coordinates.x1, coordinates.x2),
    y: Math.min(coordinates.y1, coordinates.y2),
    width: Math.abs(coordinates.x2 - coordinates.x1),
    height: Math.abs(coordinates.y2 - coordinates.y1),
    angle: 0,
  };
}

export function getParamPath(path: ParamPath) {
  return path.length > 0
    ? `${path[0]} ${path
        .slice(1)
        .map((segment) => `/${segment}`)
        .join("")}`
    : "";
}

export function parseParamValue(value: string, type: string) {
  switch (type) {
    case "number":
      return parseFloat(value);
    case "integer": {
      const result = parseInt(value);
      if (isNaN(result)) {
        throw new Error("Failed to parse value");
      }
      return result;
    }
    case "boolean":
      return value === "true";
    default:
      return value;
  }
}

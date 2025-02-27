import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CPSIResult } from "@/types/types";

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

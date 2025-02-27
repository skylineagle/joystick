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

export function generateRandomCPSIResult(): string {
  // Randomly choose a technology type
  const techTypes = ["LTE", "GSM", "WCDMA"];
  const tech = techTypes[Math.floor(Math.random() * techTypes.length)];

  // We'll use a fixed status for simplicity.
  const status = "Online";

  // Generate a random operator string and mccMnc value.
  const operator = "Operator" + (Math.floor(Math.random() * 99) + 1);
  const mccMncList = ["460-01", "460-02", "310-260", "234-15"];
  const mccMnc = mccMncList[Math.floor(Math.random() * mccMncList.length)];

  let result = `+CPSI: ${tech},${status},`;

  if (tech === "LTE") {
    // Random LTE-specific fields.
    const bands = [
      "B1",
      "B2",
      "B3",
      "B4",
      "B5",
      "B7",
      "B8",
      "B12",
      "B13",
      "B20",
      "B28",
    ];
    const band = bands[Math.floor(Math.random() * bands.length)];
    const arfcn = Math.floor(Math.random() * 3001); // LTE ARFCN (0 - 3000)
    const rxChannel = Math.floor(Math.random() * 201); // Arbitrary receive channel (0 - 200)
    const rssi = -(Math.floor(Math.random() * 51) + 50); // RSSI between -100 and -50
    const rsrp = -(Math.floor(Math.random() * 41) + 80); // RSRP between -120 and -80
    const sinr = Math.floor(Math.random() * 31); // SINR between 0 and 30
    const rsrq = -Math.floor(Math.random() * 21); // RSRQ between -20 and 0

    // Construct string: operator, mccMnc, band, arfcn, rxChannel, rssi, rsrp, sinr, rsrq
    result += `${operator},${mccMnc},${band},${arfcn},${rxChannel},${rssi},${rsrp},${sinr},${rsrq}`;
  } else if (tech === "GSM") {
    // Random GSM-specific fields.
    const bands = ["900", "1800"];
    const band = bands[Math.floor(Math.random() * bands.length)];
    const arfcn = Math.floor(Math.random() * 125); // Typical GSM ARFCN range 0-124
    const bsic = Math.floor(Math.random() * 8); // BSIC between 0 and 7
    const rssi = -(Math.floor(Math.random() * 51) + 50); // RSSI between -100 and -50
    const timingAdvance = Math.floor(Math.random() * 64); // Timing advance (0-63)

    // Construct string: operator, mccMnc, band, arfcn, bsic, rssi, timingAdvance
    result += `${operator},${mccMnc},${band},${arfcn},${bsic},${rssi},${timingAdvance}`;
  } else if (tech === "WCDMA") {
    // Random WCDMA-specific fields.
    const bands = ["850", "900", "1900", "2100"];
    const band = bands[Math.floor(Math.random() * bands.length)];
    const arfcn = Math.floor(Math.random() * 20001); // ARFCN range 0-20000
    const rxChannel = Math.floor(Math.random() * 201); // Receive channel (0-200)
    const rssi = -(Math.floor(Math.random() * 51) + 50); // RSSI between -100 and -50
    const rsrq = -Math.floor(Math.random() * 21); // RSRQ between -20 and 0

    // Construct string: operator, mccMnc, band, arfcn, rxChannel, rssi, rsrq
    result += `${operator},${mccMnc},${band},${arfcn},${rxChannel},${rssi},${rsrq}`;
  }

  return result;
}

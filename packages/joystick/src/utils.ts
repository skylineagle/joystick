import { STREAM_API_URL } from "@/config";
import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { DeviceInformation, DeviceResponse } from "@/types/types";
import { ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import { RunTargetOptions } from "@/types/db.types";
import { $ } from "bun";

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

export async function getMediaMTXPaths() {
  const response = await fetch(`${STREAM_API_URL}/v3/paths/list`);

  if (!response.ok) {
    throw new Error(`Failed to get MediaMTX paths: ${response.statusText}`);
  }

  return response.json();
}

export async function updateStatus(deviceId: string) {
  try {
    const device = await pb
      .collection("devices")
      .getOne<DeviceResponse>(deviceId);
    const pathList = await getMediaMTXPaths();
    const paths = pathList.items;

    const status = paths.find(
      (path: { name: string; ready: boolean }) =>
        path.name === device.configuration?.name
    );

    const updatedStatus = status
      ? paths.find(
          (path: { name: string; ready: boolean }) =>
            path.name === device.configuration?.name
        ).ready
        ? "on"
        : "waiting"
      : "off";

    logger.info(
      `Updating status for device ${device.configuration?.name} to ${updatedStatus}`
    );
    await pb.collection("devices").update(device.id, {
      status: updatedStatus,
    });
  } catch (error) {
    logger.error(error);
  }
}

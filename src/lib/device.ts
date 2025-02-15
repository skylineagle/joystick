import {
  ActionsResponse,
  DevicesResponse,
  ModelsResponse,
} from "@/types/db.types";
import { pb } from "./pocketbase";
import { DeviceResponse } from "@/services/device";

export async function fetchDevice(deviceId: string) {
  try {
    const device = await pb
      .collection("devices")
      .getFirstListItem<DevicesResponse<{ device: ModelsResponse }>>(
        `id = "${deviceId}"`,
        {
          expand: "device",
        }
      );

    return device;
  } catch {
    throw new Error("Failed to fetch device");
  }
}

export async function fetchDevices() {
  const records = await pb.collection("devices").getFullList<DevicesResponse>();
  return records;
}

export async function fetchDeviceActions(
  device?: DevicesResponse<{ device: ModelsResponse }>
) {
  if (!device) return [];

  const actions = await pb
    .collection("run")
    .getFullList<
      ActionsResponse<
        unknown,
        { device: DeviceResponse; action: ActionsResponse }
      >
    >(1, {
      filter: `device = "${device.expand?.device.id}"`,
      expand: "action,device",
    });
  return actions.map((action) => action?.expand?.action.name);
}

export async function fetchBitrate(deviceId: string) {
  const device = await fetchDevice(deviceId);
  const actions = await fetchDeviceActions(device);
  const bitrateAction = actions.find((action) => action === "set-bitrate");
  return bitrateAction;
}

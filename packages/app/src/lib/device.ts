import { DeviceResponse } from "@/services/device";
import { ActionsResponse } from "@/types/db.types";
import { DeviceWithModel } from "@/types/types";
import { pb } from "./pocketbase";

export async function fetchDevice(deviceId: string) {
  try {
    const device = await pb
      .collection("devices")
      .getFirstListItem<DeviceWithModel>(`id = "${deviceId}"`, {
        expand: "device",
      });

    return device;
  } catch {
    throw new Error("Failed to fetch device");
  }
}

export async function fetchDevices() {
  const records = await pb.collection("devices").getFullList<DeviceWithModel>({
    expand: "device",
  });
  return records;
}

export async function fetchDeviceActions(device?: DeviceWithModel) {
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

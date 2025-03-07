import { runAction } from "@/lib/joystick-api";
import { ActionsResponse } from "@/types/db.types";
import {
  ActionResponse,
  RunResponse,
  type DeviceResponse,
  type UpdateDevice,
} from "@/types/types";
import { pb } from "./pocketbase";

export async function getDevicesIds() {
  const records = await pb.collection("devices").getFullList<DeviceResponse>({
    fields: "id",
  });
  return records.map((record) => record.id);
}

export async function fetchDevice(deviceId: string) {
  try {
    const device = await pb
      .collection("devices")
      .getFirstListItem<DeviceResponse>(`id = "${deviceId}"`, {
        expand: "device",
      });

    return device;
  } catch (error) {
    console.log(error);

    throw new Error("Failed to fetch device");
  }
}

export async function fetchDevices() {
  const records = await pb.collection("devices").getFullList<DeviceResponse>({
    expand: "device",
  });
  return records;
}

export interface GetDevicesOptions {
  modes?: string[];
  search?: string;
}

export async function getDevices({
  modes = [],
  search,
}: GetDevicesOptions = {}) {
  const filters = [];

  if (modes.length > 0) {
    // PocketBase doesn't support direct 'in' operator, so we use OR conditions
    const modeFilters = modes.map((mode) => `mode = "${mode}"`);
    filters.push(`(${modeFilters.join(" || ")})`);
  }

  if (search?.trim()) {
    filters.push(
      `(name ~ "${search.trim()}" || configuration.name ~ "${search.trim()}")`
    );
  }

  const filterStr = filters.length > 0 ? filters.join(" && ") : "";

  const records = await pb
    .collection("devices")
    .getList<DeviceResponse>(1, 50, {
      filter: filterStr || undefined,
    });

  return records.items;
}

export async function getDeviceMode(deviceId: string) {
  const device = await pb
    .collection("devices")
    .getOne<DeviceResponse>(deviceId, {
      fields: "mode",
    });
  return device?.mode;
}

export async function updateDevice({ id, ...data }: UpdateDevice) {
  const record = await pb.collection("devices").update(id, data);
  return record;
}

export async function deleteDevice(id: string) {
  await pb.collection("devices").delete(id);
}

export async function fetchModelActions(modelId?: string) {
  if (!modelId) return [];

  const actions = await pb
    .collection("run")
    .getFullList<
      ActionsResponse<{ device: DeviceResponse; action: ActionsResponse }>
    >(1, {
      filter: `device="${modelId}"`,
      expand: "action,device",
    });

  return actions.map((action) => action?.expand?.action.name);
}

export async function gethDeviceAction(deviceId: string, actionName: string) {
  const device = await fetchDevice(deviceId);

  const result = await pb.collection("actions").getFullList<ActionResponse>({
    filter: `name = "${actionName}"`,
  });

  if (!result || result.length !== 1) return [];

  const action = result[0];
  const runAction = await pb.collection("run").getFullList<RunResponse>({
    filter: `device = "${device.expand?.device.id}" && action = "${action.id}"`,
    expand: "action,device",
  });

  return runAction;
}

export interface BatchUpdateDeviceMode {
  ids: string[];
  mode: string;
  onProgress?: (current: number, total: number) => void;
}

export async function batchUpdateDevices({
  ids,
  mode,
  onProgress,
}: BatchUpdateDeviceMode) {
  let succeeded = 0;
  let failed = 0;
  const total = ids.length;

  for (let i = 0; i < ids.length; i++) {
    try {
      await runAction({
        deviceId: ids[i],
        action: "set-mode",
        params: {
          mode,
        },
      });

      succeeded++;
    } catch (error) {
      failed++;
      console.error(`Failed to update device ${ids[i]}:`, error);
    }
    onProgress?.(i + 1, total);
  }

  return {
    succeeded,
    failed,
    total,
  };
}

export async function batchDeleteDevices(
  ids: string[],
  onProgress?: (current: number, total: number) => void
) {
  let succeeded = 0;
  let failed = 0;
  const total = ids.length;

  for (let i = 0; i < ids.length; i++) {
    try {
      await pb.collection("devices").delete(ids[i]);
      await new Promise((resolve) => setTimeout(resolve, 100));
      succeeded++;
    } catch (error) {
      failed++;
      console.error(`Failed to delete device ${ids[i]}:`, error);
    }
    onProgress?.(i + 1, total);
  }

  return {
    succeeded,
    failed,
    total,
  };
}

export async function batchSetDeviceMode(
  ids: string[],
  mode: string,
  onProgress?: (current: number, total: number) => void
) {
  return batchUpdateDevices({
    ids,
    mode,
    onProgress,
  });
}

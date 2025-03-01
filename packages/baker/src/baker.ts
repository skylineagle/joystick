import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { DeviceAutomation, DeviceResponse } from "@/types/types";
import { Baker, type Status } from "cronbake";
import { getMediaMTXPaths, toggleMode } from "./utils";

const baker = Baker.create();

async function initializeJobs() {
  try {
    const devices = await pb
      .collection("devices")
      .getFullList<DeviceResponse>();

    logger.info(`Found ${devices.length} devices`);
    for (const device of devices) {
      if (device.automation) {
        await createJob(device.id, device.automation);
        logger.info(`Initialized job for device ${device.id}`);

        await toggleMode(device.id, device.mode ?? "offline");
      }
    }

    logger.info("All device jobs initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize device jobs", error);
    throw error;
  }
}

initializeJobs();

export async function createJob(
  device: string,
  automation: DeviceAutomation
): Promise<void> {
  try {
    logger.info(`Creating job for device ${device}`);
    baker.add({
      name: device,
      cron: `@every_${automation.minutesOn + automation.minutesOff}_minutes`,
      start: false,
      callback: async () => {
        // Turn camera on
        logger.info(`Starting automation routine for device ${device}`);
        const data = await pb
          .collection("devices")
          .getOne<DeviceResponse>(device);
        if (!data.configuration) {
          throw new Error("Device configuration is null");
        }

        await toggleMode(data.id, "live");
        updateStatus();
        logger.info(`Device ${device} turned on`);

        setTimeout(async () => {
          if (baker.isRunning(device) && data.configuration?.name) {
            await toggleMode(data.id, "offline");
            updateStatus();
            logger.info(`Device ${device} turned off`);
          } else {
            logger.info(`Job for device ${device} is not running, skipping`);
          }
        }, automation.minutesOn * 60 * 1000);
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function startJob(device: string): Promise<void> {
  try {
    baker.bake(device);
    logger.info(`Job for device ${device} started`);
    logger.debug(baker.getStatus(device));
    logger.debug(baker.isRunning(device));
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function stopJob(device: string): Promise<void> {
  try {
    baker.stop(device);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function getJobStatus(device: string): Status | undefined {
  try {
    return baker.getStatus(device);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteJob(device: string): Promise<void> {
  try {
    baker.stop(device);
    baker.remove(device);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getNextExecution(device: string): Promise<Date> {
  try {
    return baker.nextExecution(device);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updateStatus() {
  try {
    const devices = await pb
      .collection("devices")
      .getFullList<DeviceResponse>();
    const pathList = await getMediaMTXPaths();
    const paths = pathList.items;

    for (const device of devices) {
      const status = paths.find(
        (path: { name: string; ready: boolean }) =>
          path.name === device.configuration?.name
      );

      await pb.collection("devices").update(device.id, {
        status: status
          ? paths.find(
              (path: { name: string; ready: boolean }) =>
                path.name === device.configuration?.name
            ).ready
            ? "on"
            : "waiting"
          : "off",
      });
    }
  } catch (error) {
    logger.error(error);
  }
}

baker.add({
  name: "live-status",
  cron: "@every_5_seconds",
  start: true,
  callback: async () => {
    await updateStatus();
  },
  onTick: () => {
    logger.debug("Updating status of cameras");
  },
});

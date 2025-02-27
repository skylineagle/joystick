import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { CameraAutomation, CamerasResponse } from "@/types/types";
import { Baker, type Status } from "cronbake";
import { getMediaMTXPaths, toggleMode } from "./utils";

const baker = Baker.create();

async function initializeJobs() {
  try {
    const cameras = await pb
      .collection("cameras")
      .getFullList<CamerasResponse>();

    logger.info(`Found ${cameras.length} cameras`);
    for (const camera of cameras) {
      if (camera.automation) {
        await createJob(camera.id, camera.automation);
        logger.info(`Initialized job for camera ${camera.id}`);

        await toggleMode(camera.id, camera.mode ?? "offline");
      }
    }

    logger.info("All camera jobs initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize camera jobs", error);
    throw error;
  }
}

initializeJobs();

export async function createJob(
  camera: string,
  automation: CameraAutomation
): Promise<void> {
  try {
    logger.info(`Creating job for camera ${camera}`);
    baker.add({
      name: camera,
      cron: `@every_${automation.minutesOn + automation.minutesOff}_minutes`,
      start: false,
      callback: async () => {
        // Turn camera on
        logger.info(`Starting automation routine for camera ${camera}`);
        const data = await pb
          .collection("cameras")
          .getOne<CamerasResponse>(camera);
        if (!data.configuration) {
          throw new Error("Camera configuration is null");
        }

        await toggleMode(data.id, "live");
        updateStatus();
        logger.info(`Camera ${camera} turned on`);

        setTimeout(async () => {
          if (baker.isRunning(camera) && data.configuration?.name) {
            await toggleMode(data.id, "offline");
            updateStatus();
            logger.info(`Camera ${camera} turned off`);
          } else {
            logger.info(`Job for camera ${camera} is not running, skipping`);
          }
        }, automation.minutesOn * 60 * 1000);
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function startJob(camera: string): Promise<void> {
  try {
    baker.bake(camera);
    logger.info(`Job for camera ${camera} started`);
    logger.debug(baker.getStatus(camera));
    logger.debug(baker.isRunning(camera));
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function stopJob(camera: string): Promise<void> {
  try {
    baker.stop(camera);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function getJobStatus(camera: string): Status | undefined {
  try {
    return baker.getStatus(camera);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteJob(camera: string): Promise<void> {
  try {
    baker.stop(camera);
    baker.remove(camera);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getNextExecution(camera: string): Promise<Date> {
  try {
    return baker.nextExecution(camera);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updateStatus() {
  try {
    const cameras = await pb
      .collection("cameras")
      .getFullList<CamerasResponse>();
    const pathList = await getMediaMTXPaths();
    const paths = pathList.items;

    for (const camera of cameras) {
      const status = paths.includes(camera.configuration?.name);

      await pb.collection("cameras").update(camera.id, {
        status: status
          ? paths.find(
              (path: { name: string; ready: boolean }) =>
                path.name === camera.configuration?.name
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

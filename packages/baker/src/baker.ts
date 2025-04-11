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
      }
    }

    logger.info("All device jobs initialized successfully");
  } catch (error) {
    logger.error(error);
    logger.error("Failed to initialize device jobs", error);
    throw error;
  }
}

// Wrap the initialization with try-catch
try {
  initializeJobs();
  logger.info("Baker initialization started");
} catch (error) {
  logger.error("Failed to start baker initialization", error);
  // Don't rethrow the error to prevent the application from crashing
}

export async function createJob(
  device: string,
  automation: DeviceAutomation
): Promise<void> {
  try {
    logger.info(`Creating job for device ${device}`);

    if (automation.automationType === "duration") {
      // Handle duration-based automation with separate on/off jobs
      const onMinutes = automation?.on?.minutes || 0;
      const offMinutes = automation?.off?.minutes || 0;
      const totalMinutes = onMinutes + offMinutes;

      // Add job to turn on the device (runs every totalMinutes)
      baker.add({
        name: `${device}_on`,
        cron: `0 */${totalMinutes} * * * *`,
        start: false,
        callback: async () => {
          // Turn camera on
          logger.info(
            `Starting duration-based ON routine for device ${device}`
          );
          const data = await pb
            .collection("devices")
            .getOne<DeviceResponse>(device);
          if (!data.configuration) {
            throw new Error("Device configuration is null");
          }

          await toggleMode(data.id, automation?.on?.mode);
          updateStatus();
          logger.info(`Device ${device} turned on (duration mode)`);
        },
      });

      // Add job to turn off the device (runs every totalMinutes)
      baker.add({
        name: `${device}_off`,
        cron: `0 ${onMinutes}-59/${totalMinutes} * * * * `,
        start: false,
        callback: async () => {
          // Turn camera on
          logger.info(
            `Starting duration-based OFF routine for device ${device}`
          );
          const data = await pb
            .collection("devices")
            .getOne<DeviceResponse>(device);
          if (!data.configuration) {
            throw new Error("Device configuration is null");
          }

          await toggleMode(data.id, automation?.off?.mode);
          updateStatus();
          logger.info(`Device ${device} turned off (duration mode)`);
        },
      });
    } else if (automation.automationType === "timeOfDay") {
      // Handle time-of-day based automation (unchanged)
      const [onHour, onMinute] =
        automation?.on?.utcDate?.split(":").map(Number) ?? [];
      const [offHour, offMinute] =
        automation?.off?.utcDate?.split(":").map(Number) ?? [];

      if (!onHour || !onMinute || !offHour || !offMinute) {
        throw new Error("Invalid time of day automation");
      }

      // Add job to turn on the device
      baker.add({
        name: `${device}_on`,
        cron: `@at_${onHour}:${onMinute}`, // min hour day month weekday
        start: false,
        callback: async () => {
          logger.info(`Starting time-of-day automation for device ${device}`);
          const data = await pb
            .collection("devices")
            .getOne<DeviceResponse>(device);
          if (!data.configuration) {
            throw new Error("Device configuration is null");
          }

          await toggleMode(data.id, automation?.on?.mode);
          updateStatus();
          logger.info(
            `Device ${device} turned on at scheduled time ${onHour}:${onMinute}`
          );
        },
      });

      // Add job to turn off the device
      baker.add({
        name: `${device}_off`,
        cron: `@at_${offHour}:${offMinute}`, // min hour day month weekday
        start: false,
        callback: async () => {
          logger.info(
            `Executing time-of-day off automation for device ${device}`
          );
          const data = await pb
            .collection("devices")
            .getOne<DeviceResponse>(device);
          if (!data.configuration) {
            throw new Error("Device configuration is null");
          }

          await toggleMode(data.id, automation?.off?.mode);
          updateStatus();
          logger.info(
            `Device ${device} turned off at scheduled time ${offHour}:${offMinute}`
          );
        },
      });
    } else {
      logger.error(`Unsupported automation type: ${automation.automationType}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function startJob(device: string): Promise<void> {
  try {
    // Always try to start both on and off jobs
    try {
      baker.bake(`${device}_on`);
      baker.bake(`${device}_off`);
      logger.info(`On/Off jobs for device ${device} started`);
    } catch (e) {
      // Try the legacy job if on/off jobs don't exist
      // baker.bake(device);
      logger.info(`Legacy job for device ${device} started`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function stopJob(device: string): Promise<void> {
  try {
    // Always try to stop both on and off jobs
    baker.stop(`${device}_on`);
    baker.stop(`${device}_off`);
    logger.info(`On/Off jobs for device ${device} stopped`);
  } catch (error) {
    throw error;
  }
}

export function getJobStatus(device: string): Status | undefined {
  try {
    const onStatus = baker.getStatus(`${device}_on`);
    const offStatus = baker.getStatus(`${device}_off`);

    if (onStatus && offStatus) {
      // If both exist, return a combined status based on their states
      // Use one of the status objects but modify its properties
      return baker.isRunning(`${device}_on`) || baker.isRunning(`${device}_off`)
        ? onStatus // Will be 'running' if the job is running
        : offStatus; // Will be 'stopped' if the job is stopped
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteJob(device: string): Promise<void> {
  try {
    // Stop and remove the on job
    baker.stop(`${device}_on`);
    baker.remove(`${device}_on`);

    // Stop and remove the off job
    baker.stop(`${device}_off`);
    baker.remove(`${device}_off`);

    logger.info(`On/Off jobs for device ${device} deleted`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getNextExecution(device: string): Promise<any> {
  try {
    const onNext = baker.nextExecution(`${device}_on`);
    const offNext = baker.nextExecution(`${device}_off`);

    // Return the earlier of the two times along with the job name
    if (onNext && offNext) {
      // Validate dates - ensure they're in the future
      const now = new Date();
      const validOnNext =
        onNext > now ? onNext : new Date(now.getTime() + 60000);
      const validOffNext =
        offNext > now ? offNext : new Date(now.getTime() + 120000);

      if (validOnNext < validOffNext) {
        return {
          nextExecution: validOnNext,
          jobName: `${device}_on`,
        };
      } else {
        return {
          nextExecution: validOffNext,
          jobName: `${device}_off`,
        };
      }
    }
  } catch (error) {
    const fallbackTime = new Date(new Date().getTime() + 60000); // 1 minute from now
    return {
      nextExecution: fallbackTime,
      jobName: device,
    };
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
      const currentStatus = device.status;
      const newStatus = status
        ? paths.find(
            (path: { name: string; ready: boolean }) =>
              path.name === device.configuration?.name
          ).ready
          ? "on"
          : "waiting"
        : "off";

      if (currentStatus !== newStatus) {
        logger.info(
          `Updating status for device ${device.id} from ${currentStatus} to ${newStatus}`
        );

        await pb.collection("devices").update(device.id, {
          status: newStatus,
        });
      }
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

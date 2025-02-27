import { MEDIAMTX_API, SWITCHER_API_URL } from "@/config";
import { logger } from "./logger";

export const API_URL = `${MEDIAMTX_API}/v3`;

export async function toggleMode(name: string, mode: string) {
  logger.info(`Toggling mode for camera ${name} to ${mode}`);
  const response = await fetch(`${SWITCHER_API_URL}/api/run/${name}/${mode}`, {
    method: "POST",
  });

  if (!response.ok) {
    logger.error(`Failed to toggle mode: ${response.statusText}`);
    throw new Error(`Failed to toggle mode: ${response.statusText}`);
  }
}

export async function getMediaMTXPaths() {
  const response = await fetch(`${API_URL}/paths/list`);

  if (!response.ok) {
    throw new Error(`Failed to get MediaMTX paths: ${response.statusText}`);
  }

  return response.json();
}

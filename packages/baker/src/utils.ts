import {
  JOYSTICK_API_URL,
  STREAM_API_URL,
  DEFAULT_API_KEY,
} from "@joystick/core";
import { logger } from "./logger";
import { pb } from "@/pocketbase";

export const API_URL = `${STREAM_API_URL}/v3`;

export async function toggleMode(name: string, mode: string) {
  logger.info(`Toggling mode for camera ${name} to ${mode}`);
  const response = await fetch(`${JOYSTICK_API_URL}/api/run/${name}/set-mode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": pb.authStore.record?.id ?? "unknown",
      "X-API-Key": DEFAULT_API_KEY,
    },
    body: JSON.stringify({ mode }),
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

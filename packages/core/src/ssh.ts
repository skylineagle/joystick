import type { DeviceResponse } from "@/types";
import { $ } from "bun";
import { join } from "node:path";
import { getActiveDeviceConnection } from "./device";

const tempKeyFiles = new Map<string, string>(); // Track temporary key files for cleanup

export async function runCommandOnDevice(
  device: DeviceResponse,
  command: string
) {
  if (!device.information) {
    throw new Error("Device information not found, cant run action on device");
  }

  const { host } = getActiveDeviceConnection(device.information);
  const { user, password, key } = device.information;

  // Use SSH key authentication
  // Create a temporary file to store the SSH key
  const tmpDir = Bun.env.TMPDIR || "/tmp";
  const keyFileName = join(tmpDir, `ssh_key_${Date.now()}`);

  if (key) {
    // Write the SSH key to the temporary file with correct permissions using Bun's file utilities
    await Bun.write(keyFileName, key);
    // Set correct permissions (Bun.write doesn't support permissions directly)
    Bun.spawn(["chmod", "600", keyFileName]);

    // Store the key file path for cleanup
    tempKeyFiles.set(`${host}-${user}`, keyFileName);
  }

  const result = key
    ? await $`sshpass -i ${keyFileName} ssh -o StrictHostKeyChecking=no ${user}@${host} '${command}'`.text()
    : password
    ? await $`sshpass -p ${password} ssh -o StrictHostKeyChecking=no ${user}@${host} '${command}'`.text()
    : await $`ssh -o StrictHostKeyChecking=no ${user}@${host} '${command}'`.text();

  return result;
}

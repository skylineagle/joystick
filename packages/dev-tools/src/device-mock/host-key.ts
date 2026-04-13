import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { $ } from "bun";

const keyDir = join(tmpdir(), "joystick-mock-ssh");
const keyPath = join(keyDir, "host_rsa");

export const ensureHostKey = async (): Promise<Buffer> => {
  if (!existsSync(keyPath)) {
    await mkdir(keyDir, { recursive: true });
    await $`ssh-keygen -t rsa -f ${keyPath} -N "" -m PEM`.quiet();
  }
  return readFile(keyPath);
};

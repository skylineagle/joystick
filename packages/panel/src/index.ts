import { pb } from "@/pocketbase";
import { ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import { logger } from "./logger";
import type { DeviceResponse } from "./types/types";

type WebSocketMessage = {
  type: string;
  device?: string;
  data?: string;
};

const connections = new Map<string, ChildProcess>();
const tempKeyFiles = new Map<string, string>(); // Track temporary key files for cleanup

Bun.serve({
  port: Number(Bun.env.PORT) || 4000,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/terminal") {
      const success = server.upgrade(req);
      if (!success) {
        const response = new Response("WebSocket upgrade failed", {
          status: 400,
        });
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        return response;
      }
      return undefined;
    }
    // Standard health check endpoint
    else if (url.pathname === "/api/health") {
      const response = new Response(
        JSON.stringify({
          status: "healthy",
          service: "panel",
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || "unknown",
        }),
        { status: 200 }
      );
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      return response;
    }
  },
  websocket: {
    async message(ws, rawMessage) {
      try {
        const message = JSON.parse(rawMessage.toString()) as WebSocketMessage;

        if (message.type === "connect" && message.device) {
          const result = await pb
            .collection("devices")
            .getFullList<DeviceResponse>(1, {
              filter: `id = "${message.device}"`,
              expand: "device",
            });

          if (result.length !== 1) {
            ws.send("Device not found");
            return;
          }

          const device = result[0];
          if (!device.information) {
            ws.send("Device information not found");
            return;
          }

          // Use safe destructuring with default values to avoid TypeScript errors
          const { host, user, password } = device.information;
          const sshKey = device.information.key as string | undefined;

          let sshProcess: ChildProcess;

          if (sshKey) {
            logger.debug("using ssh key for ssh session");
            // Use SSH key authentication
            // Create a temporary file to store the SSH key
            const tmpDir = Bun.env.TMPDIR || "/tmp";
            const keyFileName = join(
              tmpDir,
              `ssh_key_${message.device}_${Date.now()}`
            );

            try {
              // Write the SSH key to the temporary file with correct permissions using Bun's file utilities
              await Bun.write(keyFileName, sshKey);
              // Set correct permissions (Bun.write doesn't support permissions directly)
              Bun.spawn(["chmod", "600", keyFileName]);

              // Store the key file path for cleanup
              tempKeyFiles.set(message.device, keyFileName);

              const sshArgs = [
                "-o",
                "StrictHostKeyChecking=no",
                "-i",
                keyFileName,
                ...(device.expand?.device.name === Bun.env.SPECIAL_DEVICE
                  ? ["-o", "HostKeyAlgorithms=+ssh-dss"]
                  : []),
                "-tt",
                `${user}@${host}`,
              ];

              sshProcess = spawn("ssh", sshArgs);

              logger.info(`Connecting to ${host} with SSH key`);
            } catch (error) {
              logger.error(`Failed to write SSH key file: ${error}`);
              ws.send(
                `Failed to establish connection: ${(error as Error).message}`
              );
              return;
            }
          } else if (password) {
            // Use password authentication as fallback
            const sshArgs = [
              "-o",
              "StrictHostKeyChecking=no",
              ...(device.expand?.device.name === Bun.env.SPECIAL_DEVICE
                ? ["-o", "HostKeyAlgorithms=+ssh-dss"]
                : []),
              "-tt",
              `${user}@${host}`,
            ];

            sshProcess = spawn("sshpass", ["-p", password, "ssh", ...sshArgs]);
            logger.info(`Connecting to ${host} with password`);
          } else {
            ws.send("No authentication method available");
            return;
          }

          connections.set(message.device, sshProcess);

          sshProcess.stdout?.on("data", (data: Buffer) => {
            ws.send(data.toString());
          });

          sshProcess.stderr?.on("data", (data: Buffer) => {
            ws.send(data.toString());
          });

          sshProcess.on("close", () => {
            // Clean up the temporary key file if it exists
            const keyFile = tempKeyFiles.get(message.device ?? "");
            if (keyFile) {
              try {
                Bun.spawn(["rm", keyFile]);
              } catch (error) {
                logger.error(`Failed to remove temporary key file: ${error}`);
              }
              tempKeyFiles.delete(message.device ?? "");
            }

            connections.delete(message.device ?? "");
          });
        }

        if (message.type === "data" && message.data && message.device) {
          const sshProcess = connections.get(message.device);
          if (sshProcess) {
            sshProcess.stdin?.write(message.data);
          }
        }
      } catch (error) {
        logger.error(error);
        ws.send("Error: " + (error as Error).message);
      }
    },
    close() {
      // Clean up any active connections and temporary key files
      for (const [deviceId, sshProcess] of connections.entries()) {
        sshProcess.kill();
        connections.delete(deviceId);

        // Clean up any temporary key files
        const keyFile = tempKeyFiles.get(deviceId);
        if (keyFile) {
          try {
            Bun.spawn(["rm", keyFile]);
          } catch (error) {
            logger.error(`Failed to remove temporary key file: ${error}`);
          }
          tempKeyFiles.delete(deviceId);
        }
      }
    },
  },
});

import { pb } from "@/pocketbase";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import {
  createAuthPlugin,
  getActiveDeviceConnection,
  type DeviceResponse,
} from "@joystick/core";
import { Elysia } from "elysia";
import { ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import { logger } from "./logger";

type WebSocketMessage = {
  type: string;
  device?: string;
  data?: string;
};

const connections = new Map<string, ChildProcess>();
const tempKeyFiles = new Map<string, string>();

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Panel API",
          version: "0.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
            apiKey: {
              type: "apiKey",
              in: "header",
              name: "X-API-Key",
            },
          },
        },
        security: [{ bearerAuth: [] }, { apiKey: [] }],
      },
    })
  )
  .use(createAuthPlugin(pb, Bun.env.JWT_SECRET))
  .onError(({ code, error, request }) => {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error({ code, error, path: request.url }, "Request error occurred");
    return { success: false, error: errorMessage };
  })
  .onRequest(({ request }) => {
    logger.info(
      { method: request.method, path: request.url },
      "Incoming request"
    );
  })
  .get("/", () => "Panel API")
  .get("/api/health", () => ({
    status: "healthy",
    service: "panel",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "unknown",
  }))
  .ws("/terminal", {
    async message(ws, message: WebSocketMessage) {
      try {
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

          const { user, password } = device.information;
          const { host } = getActiveDeviceConnection(device.information);
          const sshKey = device.information.key as string | undefined;

          let sshProcess: ChildProcess;

          if (sshKey) {
            logger.debug("using ssh key for ssh session");
            const tmpDir = Bun.env.TMPDIR || "/tmp";
            const keyFileName = join(
              tmpDir,
              `ssh_key_${message.device}_${Date.now()}`
            );

            try {
              await Bun.write(keyFileName, sshKey);
              Bun.spawn(["chmod", "600", keyFileName]);

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
          } else {
            const sshArgs = [
              "-o",
              "StrictHostKeyChecking=no",
              ...(device.expand?.device.name === Bun.env.SPECIAL_DEVICE
                ? ["-o", "HostKeyAlgorithms=+ssh-dss"]
                : []),
              "-tt",
              `${user}@${host}`,
            ];

            sshProcess = password
              ? spawn("sshpass", ["-p", password, "ssh", ...sshArgs])
              : spawn("ssh", sshArgs);
            logger.info(`Connecting to ${host} with password`);
          }

          connections.set(message.device, sshProcess);

          sshProcess.stdout?.on("data", (data: Buffer) => {
            ws.send(data.toString());
          });

          sshProcess.stderr?.on("data", (data: Buffer) => {
            ws.send(data.toString());
          });

          sshProcess.on("close", () => {
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
      for (const [deviceId, sshProcess] of connections.entries()) {
        sshProcess.kill();
        connections.delete(deviceId);

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
  })
  .listen(Number(Bun.env.PORT) || 4000);

logger.info(`Panel service listening on port ${Number(Bun.env.PORT) || 4000}`);

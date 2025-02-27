import { ChildProcess, spawn } from "node:child_process";
import PocketBase from "pocketbase";
import { logger } from "./logger";
import type { TypedPocketBase } from "./types/db.types";
import type { DevicesResponse } from "./types/types";

type WebSocketMessage = {
  type: string;
  device?: string;
  data?: string;
};

logger.info(Bun.env.POCKETBASE_URL);

const pb = new PocketBase(Bun.env.POCKETBASE_URL) as TypedPocketBase;
const connections = new Map<string, ChildProcess>();

Bun.serve({
  port: Number(Bun.env.PORT) || 4000,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/terminal") {
      const success = server.upgrade(req);
      if (!success)
        return new Response("WebSocket upgrade failed", { status: 400 });
      return undefined;
    }
  },
  websocket: {
    async message(ws, rawMessage) {
      try {
        const message = JSON.parse(rawMessage.toString()) as WebSocketMessage;

        if (message.type === "connect" && message.device) {
          const result = await pb
            .collection("devices")
            .getFullList<DevicesResponse>(1, {
              filter: `id = "${message.device}"`,
              expand: "device",
            });

          if (result.length !== 1) {
            ws.send("Device not found");
            return;
          }

          const device = result[0];
          if (!device.configuration) {
            ws.send("Device configuration not found");
            return;
          }

          const { host, user, password } = device.configuration;

          const sshArgs = [
            "-o",
            "StrictHostKeyChecking=no",
            "-tt",
            `${user}@${host}`,
          ];

          const sshProcess = password
            ? spawn("sshpass", ["-p", password, "ssh", ...sshArgs])
            : spawn("ssh", sshArgs);

          connections.set(message.device, sshProcess);

          sshProcess.stdout?.on("data", (data: Buffer) => {
            ws.send(data.toString());
          });

          sshProcess.stderr?.on("data", (data: Buffer) => {
            ws.send(data.toString());
          });

          sshProcess.on("close", () => {
            connections.delete(message.device ?? "");
            ws.send("Connection closed");
          });
        }

        if (message.type === "data" && message.data && message.device) {
          const sshProcess = connections.get(message.device);
          if (sshProcess) {
            sshProcess.stdin?.write(message.data);
            // ws.send("Data sent");
          } else {
            ws.send("No active connection");
          }
        }

        if (message.type === "resize" && message.device) {
          const sshProcess = connections.get(message.device);
          if (sshProcess) {
            // TODO: Implement terminal resize using SIGWINCH if needed
          } else {
            ws.send("No active connection");
          }
        }
      } catch (error) {
        logger.error(error);
        ws.send("Error: " + (error as Error).message);
      }
    },
    close() {
      // Clean up any active connections
      for (const [deviceId, sshProcess] of connections.entries()) {
        sshProcess.kill();
        connections.delete(deviceId);
      }
    },
  },
});

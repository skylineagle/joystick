import { pb } from "@/pocketbase";
import { ChildProcess, spawn } from "node:child_process";
import { logger } from "./logger";
import type { DeviceResponse } from "./types/types";

type WebSocketMessage = {
  type: string;
  device?: string;
  data?: string;
};

const connections = new Map<string, ChildProcess>();

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

          const { host, user, password } = device.information;

          const sshArgs = [
            "-o",
            "StrictHostKeyChecking=no",
            ...(device.expand?.device.name === Bun.env.SPECIAL_DEVICE
              ? ["-o", "HostKeyAlgorithms=+ssh-dss"]
              : []),
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

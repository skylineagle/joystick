import { pb } from "@/pocketbase";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import type { TerminalSession } from "@joystick/core";
import {
  createAuthPlugin,
  type DeviceResponse,
  getActiveDeviceConnection,
} from "@joystick/core";
import { Elysia } from "elysia";
import { ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import { logger } from "./logger";

type WebSocketMessage = {
  type: string;
  device?: string;
  data?: string;
  sessionId?: string;
  reconnect?: boolean;
};

type Session = {
  id: string;
  sessionId: string;
  deviceId: string;
  userId: string;
  sshProcess: ChildProcess;
  keyFile?: string;
  lastActivity: Date;
  session_status: "active" | "disconnected" | "terminated";
  terminalData: string[];
};

const connections = new Map<string, Session>();
const tempKeyFiles = new Map<string, string>();

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const updateSessionActivity = async (sessionId: string) => {
  try {
    const session = connections.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.session_status = "active";

      try {
        const dbSession = await pb
          .collection("terminal_sessions")
          .getFirstListItem(
            pb.filter("session_id = {:sessionId}", { sessionId })
          );
        if (dbSession) {
          await pb.collection("terminal_sessions").update(dbSession.id, {
            last_activity: session.lastActivity.toISOString(),
            session_status: "active",
            terminal_data: session.terminalData,
          });
        }
      } catch (error) {
        logger.info(error);
        logger.error(`Failed to update session in database: ${error}`);
      }
    }
  } catch (error) {
    logger.error(`Failed to update session activity: ${error}`);
  }
};

const captureTerminalOutput = (sessionId: string, data: string) => {
  const session = connections.get(sessionId);
  if (session) {
    session.terminalData.push(data);

    if (session.terminalData.length > 1000) {
      session.terminalData = session.terminalData.slice(-500);
    }
  }
};

const createTerminalSession = async (
  deviceId: string,
  userId: string,
  sshProcess: ChildProcess,
  keyFile?: string
): Promise<Session> => {
  const sessionId = generateSessionId();
  const now = new Date();

  const session: Session = {
    id: sessionId,
    sessionId,
    deviceId,
    userId,
    sshProcess,
    keyFile,
    lastActivity: now,
    session_status: "active",
    terminalData: [],
  };

  connections.set(sessionId, session);

  try {
    const sessionData = {
      session_id: sessionId,
      user: userId,
      device: deviceId,
      session_status: "active",
      last_activity: now.toISOString(),
      terminal_data: {},
    };

    logger.info(
      `Creating session in database: ${JSON.stringify(sessionData, null, 2)}`
    );

    await pb.collection("terminal_sessions").create(sessionData);
    logger.info(`Session ${sessionId} created successfully in database`);
  } catch (error) {
    logger.info("Session creation error:", error);
    logger.error(`Failed to save session to database: ${error}`);
  }

  return session;
};

const cleanupSession = async (sessionId: string) => {
  const session = connections.get(sessionId);
  if (!session) return;

  try {
    session.sshProcess.kill();

    if (session.keyFile) {
      try {
        Bun.spawn(["rm", session.keyFile]);
      } catch (error) {
        logger.error(`Failed to remove temporary key file: ${error}`);
      }
    }

    connections.delete(sessionId);

    try {
      const dbSession = await pb
        .collection("terminal_sessions")
        .getFirstListItem(
          pb.filter("session_id = {:sessionId}", { sessionId })
        );
      if (dbSession) {
        await pb.collection("terminal_sessions").update(dbSession.id, {
          session_status: "terminated",
          last_activity: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error(`Failed to update session status in database: ${error}`);
    }
  } catch (error) {
    logger.error(`Failed to cleanup session: ${error}`);
  }
};

const disconnectSession = async (sessionId: string) => {
  const session = connections.get(sessionId);
  if (!session) return;

  try {
    const dbSession = await pb
      .collection("terminal_sessions")
      .getFirstListItem(`session_id = "${sessionId}"`);
    if (dbSession) {
      await pb.collection("terminal_sessions").update(dbSession.id, {
        session_status: "disconnected",
        last_activity: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error(`Failed to mark session as disconnected: ${error}`);
  }
};

const reconnectToSession = async (
  sessionId: string,
  deviceId: string,
  userId: string
): Promise<Session | null> => {
  try {
    let existingSession = connections.get(sessionId);

    if (existingSession && existingSession.sshProcess) {
      logger.info(
        `Found active session ${sessionId} in memory with SSH process`
      );

      try {
        await pb.collection("terminal_sessions").update(existingSession.id, {
          session_status: "active",
          last_activity: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`Failed to update session status in database: ${error}`);
      }

      return existingSession;
    }

    if (!existingSession) {
      try {
        logger.info(
          `Looking for session ${sessionId} in database for device ${deviceId} and user ${userId}`
        );

        const dbSession = await pb
          .collection("terminal_sessions")
          .getFirstListItem(
            `session_id = "${sessionId}" && device = "${deviceId}" && user = "${userId}" && session_status != "terminated"`
          );

        if (!dbSession) {
          logger.info(`Session ${sessionId} not found in database`);
          return null;
        }

        logger.info(
          `Found session ${sessionId} in database, status: ${dbSession.session_status}`
        );

        existingSession = {
          id: dbSession.id,
          sessionId: dbSession.session_id,
          deviceId: dbSession.device,
          userId: dbSession.user,
          sshProcess: null as any,
          lastActivity: new Date(dbSession.last_activity),
          session_status: dbSession.session_status,
          terminalData: Array.isArray(dbSession.terminal_data)
            ? dbSession.terminal_data
            : [],
        };
      } catch (error) {
        logger.error(`Failed to find session in database: ${error}`);
        return null;
      }
    } else {
      logger.info(`Found session ${sessionId} in memory but no SSH process`);
    }

    if (existingSession.session_status === "terminated") {
      return null;
    }

    const device = await pb
      .collection("devices")
      .getOne<DeviceResponse>(deviceId);
    if (!device.information) {
      return null;
    }

    const { user, password } = device.information;
    const { host } = getActiveDeviceConnection(device.information);
    const sshKey = device.information.key as string | undefined;

    let sshProcess: ChildProcess;
    let keyFile: string | undefined;

    if (sshKey) {
      logger.debug("reconnecting with ssh key");
      const tmpDir = Bun.env.TMPDIR || "/tmp";
      keyFile = join(tmpDir, `ssh_key_${deviceId}_${Date.now()}`);

      await Bun.write(keyFile, sshKey);
      Bun.spawn(["chmod", "600", keyFile]);

      const sshArgs = [
        "-o",
        "StrictHostKeyChecking=no",
        "-i",
        keyFile,
        ...(device.expand?.device?.name === Bun.env.SPECIAL_DEVICE
          ? ["-o", "HostKeyAlgorithms=+ssh-dss"]
          : []),
        "-tt",
        `${user}@${host}`,
      ];

      sshProcess = spawn("ssh", sshArgs);
    } else {
      const sshArgs = [
        "-o",
        "StrictHostKeyChecking=no",
        ...(device.expand?.device?.name === Bun.env.SPECIAL_DEVICE
          ? ["-o", "HostKeyAlgorithms=+ssh-dss"]
          : []),
        "-tt",
        `${user}@${host}`,
      ];

      sshProcess = password
        ? spawn("sshpass", ["-p", password, "ssh", ...sshArgs])
        : spawn("ssh", sshArgs);
    }

    const session: Session = {
      id: existingSession.id,
      sessionId,
      deviceId,
      userId,
      sshProcess,
      keyFile,
      lastActivity: new Date(),
      session_status: "active",
      terminalData: existingSession.terminalData,
    };

    connections.set(sessionId, session);

    try {
      await pb.collection("terminal_sessions").update(existingSession.id, {
        session_status: "active",
        last_activity: session.lastActivity.toISOString(),
      });
    } catch (error) {
      logger.error(`Failed to update session status in database: ${error}`);
    }

    return session;
  } catch (error) {
    logger.error(`Failed to reconnect to session: ${error}`);
    return null;
  }
};

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
  .get("/api/terminal/sessions/:deviceId", async ({ params, auth }) => {
    try {
      const user = auth.user;

      const dbSessions = await pb
        .collection("terminal_sessions")
        .getFullList<TerminalSession>({
          filter: `device = "${params.deviceId}" && user = "${user.id}" && session_status != "terminated"`,
          sort: "-last_activity",
          perPage: 10,
          expand: "device,user",
        });

      const sessions = dbSessions.map((session) => ({
        id: session.id,
        session_id: session.session_id,
        user: session.expand?.user?.username,
        device: session.expand?.device?.name,
        session_status: session.session_status,
        last_activity: session.last_activity,
        created_at: session.created,
        terminal_data: session.terminal_data || {},
      }));

      return { success: true, sessions };
    } catch (error) {
      logger.error(`Failed to get sessions: ${error}`);
      return { success: false, error: "Failed to get sessions" };
    }
  })
  .ws("/terminal", {
    async message(ws, message: WebSocketMessage) {
      try {
        const token = ws.data.query?.token;
        if (!token) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Authentication required",
            })
          );
          return;
        }

        const userId = ws.data.auth.userId;

        if (message.type === "connect" && message.device) {
          let session: Session | null = null;

          if (message.reconnect && message.sessionId) {
            session = await reconnectToSession(
              message.sessionId,
              message.device,
              userId as string
            );

            if (session) {
              ws.send(
                JSON.stringify({
                  type: "session_restored",
                  sessionId: session.sessionId,
                  message: "Session restored successfully",
                })
              );

              session.sshProcess.stdout?.on("data", (data: Buffer) => {
                const output = data.toString();
                ws.send(output);
                captureTerminalOutput(session!.sessionId, output);
                updateSessionActivity(session!.sessionId);
              });

              session.sshProcess.stderr?.on("data", (data: Buffer) => {
                const output = data.toString();
                ws.send(output);
                captureTerminalOutput(session!.sessionId, output);
                updateSessionActivity(session!.sessionId);
              });

              session.sshProcess.on("close", () => {
                cleanupSession(session!.sessionId);
              });

              if (session.terminalData.length > 0) {
                ws.send(
                  JSON.stringify({
                    type: "terminal_data",
                    sessionId: session.sessionId,
                    data: session.terminalData.join(""),
                  })
                );
              }

              return;
            } else {
              ws.send(
                JSON.stringify({
                  type: "session_not_found",
                  message: "Session not found or expired",
                })
              );
              return;
            }
          }

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
          let keyFile: string | undefined;

          if (sshKey) {
            logger.debug("using ssh key for ssh session");
            const tmpDir = Bun.env.TMPDIR || "/tmp";
            keyFile = join(tmpDir, `ssh_key_${message.device}_${Date.now()}`);

            try {
              await Bun.write(keyFile, sshKey);
              Bun.spawn(["chmod", "600", keyFile]);

              const sshArgs = [
                "-o",
                "StrictHostKeyChecking=no",
                "-i",
                keyFile,
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

          session = await createTerminalSession(
            message.device,
            ws.data.auth.user.id,
            sshProcess,
            keyFile
          );

          ws.send(
            JSON.stringify({
              type: "session_created",
              sessionId: session.sessionId,
              message: "Session created successfully",
            })
          );

          session.sshProcess.stdout?.on("data", (data: Buffer) => {
            const output = data.toString();
            ws.send(output);
            captureTerminalOutput(session.sessionId, output);
            updateSessionActivity(session.sessionId);
          });

          session.sshProcess.stderr?.on("data", (data: Buffer) => {
            const output = data.toString();
            ws.send(output);
            captureTerminalOutput(session.sessionId, output);
            updateSessionActivity(session.sessionId);
          });

          session.sshProcess.on("close", () => {
            cleanupSession(session.sessionId);
          });
        }

        if (message.type === "data" && message.data && message.device) {
          const session = connections.get(message.sessionId || "");
          if (session && session.deviceId === message.device) {
            session.sshProcess.stdin?.write(message.data);
            updateSessionActivity(session.sessionId);
          }
        }

        if (message.type === "disconnect" && message.sessionId) {
          const session = connections.get(message.sessionId);
          if (session) {
            try {
              const dbSession = await pb
                .collection("terminal_sessions")
                .getFirstListItem(`session_id = "${message.sessionId}"`);
              if (dbSession) {
                await pb.collection("terminal_sessions").update(dbSession.id, {
                  session_status: "disconnected",
                  last_activity: new Date().toISOString(),
                });
              }
            } catch (error) {
              logger.error(`Failed to mark session as disconnected: ${error}`);
            }
          }

          await cleanupSession(message.sessionId);
          ws.send(
            JSON.stringify({
              type: "session_terminated",
              sessionId: message.sessionId,
              message: "Session terminated",
            })
          );
        }

        if (message.type === "pause" && message.sessionId) {
          const session = connections.get(message.sessionId);
          if (session) {
            try {
              const dbSession = await pb
                .collection("terminal_sessions")
                .getFirstListItem(`session_id = "${message.sessionId}"`);
              if (dbSession) {
                await pb.collection("terminal_sessions").update(dbSession.id, {
                  last_activity: new Date().toISOString(),
                  terminal_data: session.terminalData,
                });
              }
            } catch (error) {
              logger.error(`Failed to pause session: ${error}`);
            }
          }
        }

        if (message.type === "resume" && message.sessionId) {
          const session = connections.get(message.sessionId);
          if (session) {
            try {
              const dbSession = await pb
                .collection("terminal_sessions")
                .getFirstListItem(`session_id = "${message.sessionId}"`);
              if (dbSession) {
                await pb.collection("terminal_sessions").update(dbSession.id, {
                  session_status: "active",
                  last_activity: new Date().toISOString(),
                  terminal_data: session.terminalData,
                });
              }
            } catch (error) {
              logger.error(`Failed to resume session: ${error}`);
            }
          }
        }
      } catch (error) {
        logger.error(error);
        ws.send("Error: " + (error as Error).message);
      }
    },
    close() {
      logger.info("WebSocket connection closed");
    },
  })
  .listen(Number(Bun.env.PORT) || 4000);
logger.info(`Panel service listening on port ${Number(Bun.env.PORT) || 4000}`);

import pino from "pino";

export const logger = pino({
  level: "debug",
  transport:
    process.env.LOG_FORMAT !== "json"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});

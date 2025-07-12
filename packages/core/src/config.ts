export const POCKETBASE_URL =
  process.env.POCKETBASE_URL || "http://localhost:8090";
export const STREAM_API_URL =
  process.env.STREAM_API_URL || "http://localhost:9997";
export const SWITCHER_API_URL =
  process.env.SWITCHER_API_URL || "http://localhost:8080";
export const JOYSTICK_API_URL =
  process.env.JOYSTICK_API_URL || "http://localhost:8000";
export const USERNAME = process.env.USERNAME || "system@joystick.io";
export const SUPERUSER_USERNAME =
  process.env.SUPERUSER_USERNAME || "admin@joystick.io";
export const PASSWORD = process.env.PASSWORD || "Aa123456";
export const DEFAULT_API_KEY =
  process.env.JOYSTICK_API_KEY || "dev-api-key-12345";
export const INNGEST_BASE_URL =
  process.env.INNGEST_URL ||
  (process.env.PROD ? "/inngest" : "http://localhost:8288");
export const INNGEST_EVENT_KEY = process.env.INNGEST_EVENT_KEY || "dev";

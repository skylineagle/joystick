export const SMS_GATEWAY_URL =
  Bun.env.SMS_SERVER_URL || "http://localhost:8080";
export const SMS_GATEWAY_USERNAME = Bun.env.SMS_GATEWAY_USERNAME || "admin";
export const SMS_GATEWAY_PASSWORD = Bun.env.SMS_GATEWAY_PASSWORD || "Aa123456";
export const SMS_GATEWAY_MODEM = Bun.env.SMS_GATEWAY_MODEM || "1";

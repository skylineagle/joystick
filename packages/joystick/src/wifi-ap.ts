import { pb } from "@/pocketbase";
import {
  getWifiClients,
  getWifiConfig,
  getWifiStatus,
  getWifiTraffic,
  getRutApiCredentials,
  getRutApiUrl,
  login,
  setWifiConfig,
  type DeviceResponse,
  type WifiApConfig,
} from "@joystick/core";
import { Elysia, t } from "elysia";

const isInternalRequest = (request: Request): boolean =>
  request.headers.get("x-internal-secret") ===
  (Bun.env.JOYSTICK_INTERNAL_SECRET ?? "internal-secret");

export const wifiApPlugin = new Elysia()
  .get("/api/wifi-ap/:device/status", async ({ params, request, set }) => {
    try {
      const device = await pb
        .collection("devices")
        .getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      const token = await login(baseUrl, user, password);
      return await getWifiStatus(baseUrl, token);
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/api/wifi-ap/:device/clients", async ({ params, request, set }) => {
    try {
      const device = await pb
        .collection("devices")
        .getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      const token = await login(baseUrl, user, password);
      return await getWifiClients(baseUrl, token);
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/api/wifi-ap/:device/traffic", async ({ params, request, set }) => {
    try {
      const device = await pb
        .collection("devices")
        .getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      const token = await login(baseUrl, user, password);
      return await getWifiTraffic(baseUrl, token);
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/api/wifi-ap/:device/config", async ({ params, request, set }) => {
    try {
      const device = await pb
        .collection("devices")
        .getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      const token = await login(baseUrl, user, password);
      return await getWifiConfig(baseUrl, token);
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .put(
    "/api/wifi-ap/:device/config",
    async ({ params, body, request, set }) => {
      try {
        const device = await pb
          .collection("devices")
          .getOne<DeviceResponse>(params.device);
        const baseUrl = getRutApiUrl(device.information);
        const { user, password } = getRutApiCredentials(device.information);
        const token = await login(baseUrl, user, password);
        await setWifiConfig(baseUrl, token, body as Partial<WifiApConfig>);
        return { success: true };
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    { body: t.Record(t.String(), t.Any()) }
  );

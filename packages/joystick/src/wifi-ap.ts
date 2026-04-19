import { pb } from "@/pocketbase";
import {
  getWifiClients,
  getWifiConfig,
  getWifiStatus,
  getWifiTraffic,
  getRutApiCredentials,
  getRutApiUrl,
  setWifiConfig,
  type DeviceResponse,
  type WifiApConfig,
} from "@joystick/core";
import { Elysia, t } from "elysia";

export const wifiApPlugin = new Elysia()
  .get("/api/wifi-ap/:device/status", async ({ params, set }) => {
    try {
      const device = await pb.collection("devices").getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      return await getWifiStatus(baseUrl, user, password);
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/api/wifi-ap/:device/clients", async ({ params, set }) => {
    try {
      const device = await pb.collection("devices").getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      return await getWifiClients(baseUrl, user, password);
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/api/wifi-ap/:device/traffic", async ({ params, set }) => {
    try {
      const device = await pb.collection("devices").getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      return await getWifiTraffic(baseUrl, user, password);
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/api/wifi-ap/:device/config", async ({ params, set }) => {
    try {
      const device = await pb.collection("devices").getOne<DeviceResponse>(params.device);
      const baseUrl = getRutApiUrl(device.information);
      const { user, password } = getRutApiCredentials(device.information);
      return await getWifiConfig(baseUrl, user, password);
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
    async ({ params, body, set }) => {
      try {
        const device = await pb.collection("devices").getOne<DeviceResponse>(params.device);
        const baseUrl = getRutApiUrl(device.information);
        const { user, password } = getRutApiCredentials(device.information);
        await setWifiConfig(baseUrl, user, password, body as Partial<WifiApConfig>);
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

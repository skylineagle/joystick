import { joystickApi, createUrl } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import { useQuery } from "@tanstack/react-query";

export type WifiApStatus = {
  enabled: boolean;
  ssid: string;
  channel: number;
  band: string;
  frequency: number;
  txPower: number;
  security: string;
  clientCount: number;
};

export type WifiApConfig = {
  ssid: string;
  password: string;
  channel: number;
  band: string;
  security: "none" | "psk" | "psk2";
  txPower: number;
  maxClients: number;
  hidden: boolean;
};

export type WifiClient = {
  mac: string;
  ip: string;
  hostname: string;
  signal: number;
  txBytes: number;
  rxBytes: number;
  connectedSince: string;
};

export type WifiTraffic = {
  interface: string;
  txBytes: number;
  rxBytes: number;
  txPackets: number;
  rxPackets: number;
  timestamp: string;
};

export function useWifiApStatus(deviceId: string) {
  return useQuery<WifiApStatus>({
    queryKey: ["wifi-ap-status", deviceId],
    queryFn: () =>
      joystickApi.get<WifiApStatus>(
        createUrl(urls.joystick, `/api/wifi-ap/${deviceId}/status`)
      ),
    refetchInterval: 10_000,
    enabled: !!deviceId,
  });
}

export function useWifiClients(deviceId: string) {
  return useQuery<WifiClient[]>({
    queryKey: ["wifi-ap-clients", deviceId],
    queryFn: () =>
      joystickApi.get<WifiClient[]>(
        createUrl(urls.joystick, `/api/wifi-ap/${deviceId}/clients`)
      ),
    refetchInterval: 10_000,
    enabled: !!deviceId,
  });
}

export function useWifiTraffic(deviceId: string) {
  return useQuery<WifiTraffic>({
    queryKey: ["wifi-ap-traffic", deviceId],
    queryFn: () =>
      joystickApi.get<WifiTraffic>(
        createUrl(urls.joystick, `/api/wifi-ap/${deviceId}/traffic`)
      ),
    refetchInterval: 10_000,
    enabled: !!deviceId,
  });
}

export function useWifiConfig(deviceId: string) {
  return useQuery<WifiApConfig>({
    queryKey: ["wifi-ap-config", deviceId],
    queryFn: () =>
      joystickApi.get<WifiApConfig>(
        createUrl(urls.joystick, `/api/wifi-ap/${deviceId}/config`)
      ),
    enabled: !!deviceId,
  });
}

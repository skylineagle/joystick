import { RUT_MOCK_PORT } from "../constants";

type IfaceConfig = {
  id: string;
  wifi_device: string;
  disabled: boolean;
  mode: string;
  ssid: string;
  encryption: string;
  key: string;
  hidden: boolean;
  isolate: boolean;
  wmm: boolean;
  max_sta: number;
  network: string;
};

type DeviceConfig = {
  id: string;
  disabled: boolean;
  type: string;
  channel: string;
  hwmode: string;
  htmode: string;
  txpower: number;
  country: string;
};

let ifaceConfig: IfaceConfig = {
  id: "default_radio0",
  wifi_device: "radio0",
  disabled: false,
  mode: "ap",
  ssid: "MockAP-RUT950",
  encryption: "psk2",
  key: "mockpass1",
  hidden: false,
  isolate: false,
  wmm: true,
  max_sta: 32,
  network: "lan",
};

let deviceConfig: DeviceConfig = {
  id: "radio0",
  disabled: false,
  type: "mac80211",
  channel: "6",
  hwmode: "11g",
  htmode: "HT20",
  txpower: 20,
  country: "US",
};

const mockClients = [
  {
    macaddr: "AA:BB:CC:11:22:33",
    ipaddr: "192.168.1.101",
    hostname: "laptop-alice",
    signal: "-45",
    tx_rate: 72200,
    rx_rate: 54000,
    band: "2.4GHz",
    expires: 0,
  },
  {
    macaddr: "DD:EE:FF:44:55:66",
    ipaddr: "192.168.1.102",
    hostname: "phone-bob",
    signal: "-62",
    tx_rate: 54000,
    rx_rate: 24000,
    band: "2.4GHz",
    expires: 0,
  },
  {
    macaddr: "11:22:33:AA:BB:CC",
    ipaddr: "192.168.1.103",
    hostname: "tablet-carol",
    signal: "-71",
    tx_rate: 24000,
    rx_rate: 12000,
    band: "2.4GHz",
    expires: 0,
  },
];

const buildIfaceStatus = () => ({
  id: ifaceConfig.id,
  wifi_device: ifaceConfig.wifi_device,
  mode: ifaceConfig.mode,
  ssid: ifaceConfig.ssid,
  encryption: ifaceConfig.encryption,
  num_assoc: ifaceConfig.disabled ? 0 : mockClients.length,
  status: ifaceConfig.disabled ? "disabled" : "connected",
  ht_supported: true,
  vht_supported: false,
  clients: ifaceConfig.disabled ? [] : mockClients,
  device: {
    device: deviceConfig.id,
    name: deviceConfig.id,
    up: !deviceConfig.disabled,
    pending: false,
  },
});

const buildDeviceStatus = () => ({
  id: deviceConfig.id,
  name: deviceConfig.id,
  up: !deviceConfig.disabled,
  pending: false,
  disabled: deviceConfig.disabled,
  channel: parseInt(deviceConfig.channel) || 0,
  frequency: deviceConfig.hwmode.includes("a") ? 5180 : 2437,
  txpower: deviceConfig.txpower,
  txpower_offset: 0,
  country: deviceConfig.country,
  hwmodes: ["b", "g", "n"],
  htmodes: ["HT20", "HT40"],
});

const handleRequest = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/api/login" && req.method === "POST") {
    return Response.json({
      success: true,
      data: { token: "mock-rest-token-rut950" },
    });
  }

  if (path === "/api/wireless/interfaces/status" && req.method === "GET") {
    return Response.json({ success: true, data: [buildIfaceStatus()] });
  }

  if (
    path.startsWith("/api/wireless/interfaces/status/") &&
    req.method === "GET"
  ) {
    const id = path.split("/").at(-1);
    if (id !== ifaceConfig.id)
      return new Response("Not found", { status: 404 });
    return Response.json({ success: true, data: buildIfaceStatus() });
  }

  if (path === "/api/wireless/interfaces/config" && req.method === "GET") {
    return Response.json({ success: true, data: [{ ...ifaceConfig }] });
  }

  if (
    path.startsWith("/api/wireless/interfaces/config/") &&
    req.method === "GET"
  ) {
    const id = path.split("/").at(-1);
    if (id !== ifaceConfig.id)
      return new Response("Not found", { status: 404 });
    return Response.json({ success: true, data: { ...ifaceConfig } });
  }

  if (
    path.startsWith("/api/wireless/interfaces/config/") &&
    req.method === "PUT"
  ) {
    const id = path.split("/").at(-1);
    if (id !== ifaceConfig.id)
      return new Response("Not found", { status: 404 });
    const updates = (await req.json()) as Partial<IfaceConfig>;
    ifaceConfig = { ...ifaceConfig, ...updates, id: ifaceConfig.id };
    return Response.json({ success: true, data: { id: ifaceConfig.id } });
  }

  if (path === "/api/wireless/devices/status" && req.method === "GET") {
    return Response.json({ success: true, data: [buildDeviceStatus()] });
  }

  if (
    path.startsWith("/api/wireless/devices/status/") &&
    req.method === "GET"
  ) {
    const id = path.split("/").at(-1);
    if (id !== deviceConfig.id)
      return new Response("Not found", { status: 404 });
    return Response.json({ success: true, data: buildDeviceStatus() });
  }

  if (path === "/api/wireless/devices/config" && req.method === "GET") {
    return Response.json({ success: true, data: [{ ...deviceConfig }] });
  }

  if (
    path.startsWith("/api/wireless/devices/config/") &&
    req.method === "GET"
  ) {
    const id = path.split("/").at(-1);
    if (id !== deviceConfig.id)
      return new Response("Not found", { status: 404 });
    return Response.json({ success: true, data: { ...deviceConfig } });
  }

  if (
    path.startsWith("/api/wireless/devices/config/") &&
    req.method === "PUT"
  ) {
    const id = path.split("/").at(-1);
    if (id !== deviceConfig.id)
      return new Response("Not found", { status: 404 });
    const updates = (await req.json()) as Partial<DeviceConfig>;
    deviceConfig = { ...deviceConfig, ...updates, id: deviceConfig.id };
    return Response.json({ success: true, data: { id: deviceConfig.id } });
  }

  return new Response("Not found", { status: 404 });
};

Bun.serve({
  port: RUT_MOCK_PORT,
  fetch: handleRequest,
});

console.log(`RUT950 mock running on port ${RUT_MOCK_PORT}`);

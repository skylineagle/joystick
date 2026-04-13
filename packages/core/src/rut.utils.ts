import type { DeviceInformation, WifiApStatus, WifiApConfig, WifiClient, WifiTraffic } from "./types/index";

export const getRutApiUrl = (info: DeviceInformation): string =>
  `http://${info.host}:${info.rutApiPort ?? 80}`;

export const getRutApiCredentials = (info: DeviceInformation): { user: string; password: string } => ({
  user: info.rutApiUser ?? info.user,
  password: info.rutApiPassword ?? info.password,
});

export async function login(baseUrl: string, username: string, password: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error("Failed to authenticate with device API");
  }

  return json.data.token as string;
}

export async function sendSms(
  baseUrl: string,
  username: string,
  password: string,
  phoneNumber: string,
  message: string,
  modem: string
): Promise<unknown> {
  const token = await login(baseUrl, username, password);

  const response = await fetch(`${baseUrl}/api/messages/actions/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: { number: phoneNumber, message, modem } }),
  });

  const json = await response.json();
  return json.data;
}

type RutIfaceStatus = {
  id: string;
  mode: string;
  ssid: string;
  encryption: string;
  num_assoc: number;
  status: string;
  clients: Array<{
    macaddr: string;
    ipaddr: string;
    hostname: string;
    signal: string | number;
    tx_rate: number;
    rx_rate: number;
    band: string;
    expires: number;
    interface?: string;
    device?: string;
  }>;
};

type RutDeviceStatus = {
  id: string;
  name: string;
  up: boolean;
  disabled: boolean;
  channel: number;
  frequency: number;
  txpower: number;
};

type RutIfaceConfig = {
  id: string;
  wifi_device: string;
  disabled: boolean;
  mode: string;
  ssid: string;
  encryption: string;
  key?: string;
  hidden?: boolean;
  max_sta?: number;
  network: string;
};

type RutDeviceConfig = {
  id: string;
  disabled: boolean;
  type: string;
  channel: string;
  hwmode: string;
  htmode: string;
  txpower: number;
  country: string;
};

async function restGet<T>(baseUrl: string, token: string, path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json();
  if (!response.ok || json.success === false) {
    throw new Error(`GET ${path} failed`);
  }
  return json.data as T;
}

async function restPut(baseUrl: string, token: string, path: string, body: unknown): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`PUT ${path} failed`);
  }
}

export async function getWifiStatus(
  baseUrl: string,
  username: string,
  password: string
): Promise<WifiApStatus> {
  const token = await login(baseUrl, username, password);

  const [ifaces, devices] = await Promise.all([
    restGet<RutIfaceStatus[]>(baseUrl, token, "/api/wireless/interfaces/status"),
    restGet<RutDeviceStatus[]>(baseUrl, token, "/api/wireless/devices/status"),
  ]);

  const apIface = ifaces.find((i) => i.mode === "ap") ?? ifaces[0];
  const radio = devices[0];

  return {
    enabled: !radio.disabled && radio.up,
    ssid: apIface.ssid,
    channel: radio.channel,
    band: radio.frequency >= 5000 ? "5GHz" : "2.4GHz",
    frequency: radio.frequency,
    txPower: radio.txpower,
    security: apIface.encryption,
    clientCount: apIface.num_assoc,
  };
}

export async function getWifiConfig(
  baseUrl: string,
  username: string,
  password: string
): Promise<WifiApConfig> {
  const token = await login(baseUrl, username, password);

  const [ifaces, devices] = await Promise.all([
    restGet<RutIfaceConfig[]>(baseUrl, token, "/api/wireless/interfaces/config"),
    restGet<RutDeviceConfig[]>(baseUrl, token, "/api/wireless/devices/config"),
  ]);

  const apIface = ifaces.find((i) => i.mode === "ap") ?? ifaces[0];
  const radio = devices[0];

  return {
    ssid: apIface.ssid,
    password: apIface.key ?? "",
    channel: radio.channel === "auto" ? 0 : parseInt(radio.channel) || 0,
    band: radio.hwmode,
    security: apIface.encryption as "none" | "psk" | "psk2",
    txPower: radio.txpower,
    maxClients: apIface.max_sta ?? 32,
    hidden: apIface.hidden === true,
  };
}

export async function setWifiConfig(
  baseUrl: string,
  username: string,
  password: string,
  config: Partial<WifiApConfig>
): Promise<void> {
  const token = await login(baseUrl, username, password);

  const [ifaces, devices] = await Promise.all([
    restGet<RutIfaceConfig[]>(baseUrl, token, "/api/wireless/interfaces/config"),
    restGet<RutDeviceConfig[]>(baseUrl, token, "/api/wireless/devices/config"),
  ]);

  const apIface = ifaces.find((i) => i.mode === "ap") ?? ifaces[0];
  const radio = devices[0];

  const ifaceBody: Record<string, unknown> = {
    wifi_device: apIface.wifi_device,
    disabled: apIface.disabled,
    mode: apIface.mode,
    ssid: config.ssid ?? apIface.ssid,
    encryption: config.security ?? apIface.encryption,
    network: apIface.network,
  };

  if (config.password !== undefined) ifaceBody.key = config.password;
  if (config.maxClients !== undefined) ifaceBody.max_sta = config.maxClients;
  if (config.hidden !== undefined) ifaceBody.hidden = config.hidden;

  const devBody: Record<string, unknown> = {
    disabled: radio.disabled,
    type: radio.type,
    hwmode: config.band ?? radio.hwmode,
    htmode: radio.htmode,
    country: radio.country,
    channel: config.channel !== undefined ? String(config.channel) : radio.channel,
    txpower: config.txPower !== undefined ? config.txPower : radio.txpower,
  };

  await Promise.all([
    restPut(baseUrl, token, `/api/wireless/interfaces/config/${apIface.id}`, ifaceBody),
    restPut(baseUrl, token, `/api/wireless/devices/config/${radio.id}`, devBody),
  ]);
}

export async function getWifiClients(
  baseUrl: string,
  username: string,
  password: string
): Promise<WifiClient[]> {
  const token = await login(baseUrl, username, password);

  const ifaces = await restGet<RutIfaceStatus[]>(
    baseUrl,
    token,
    "/api/wireless/interfaces/status"
  );

  const apIface = ifaces.find((i) => i.mode === "ap") ?? ifaces[0];
  const clients = apIface?.clients ?? [];

  return clients.map((client) => ({
    mac: client.macaddr,
    ip: client.ipaddr,
    hostname: client.hostname,
    signal: typeof client.signal === "string" ? parseInt(client.signal) : client.signal,
    txBytes: client.tx_rate,
    rxBytes: client.rx_rate,
    connectedSince: "",
  }));
}

export async function getWifiTraffic(
  baseUrl: string,
  _username: string,
  _password: string
): Promise<WifiTraffic> {
  return {
    interface: "wlan0",
    rxBytes: 0,
    rxPackets: 0,
    txBytes: 0,
    txPackets: 0,
    timestamp: new Date().toISOString(),
  };
}

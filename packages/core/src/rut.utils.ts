import type { DeviceInformation, WifiApStatus, WifiApConfig, WifiClient, WifiTraffic } from "./types/index";

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

export async function getWifiStatus(baseUrl: string, token: string): Promise<WifiApStatus> {
  const response = await fetch(`${baseUrl}/api/network/wireless`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json();
  const d = json.data;

  return {
    enabled: d.enabled,
    ssid: d.ssid,
    channel: d.channel,
    band: d.band,
    frequency: d.frequency,
    txPower: d.txpower,
    security: d.encryption,
    clientCount: 0,
  };
}

export async function getWifiConfig(baseUrl: string, token: string): Promise<WifiApConfig> {
  const response = await fetch(`${baseUrl}/api/network/wireless`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json();
  const d = json.data;

  return {
    ssid: d.ssid,
    password: d.key,
    channel: d.channel,
    band: d.band,
    security: d.encryption,
    txPower: d.txpower,
    maxClients: d.maxassoc,
    hidden: d.hidden,
  };
}

export async function setWifiConfig(
  baseUrl: string,
  token: string,
  config: Partial<WifiApConfig>
): Promise<void> {
  const body: Record<string, unknown> = { ...config };

  if (config.txPower !== undefined) {
    body.txpower = config.txPower;
    delete body.txPower;
  }
  if (config.security !== undefined) {
    body.encryption = config.security;
    delete body.security;
  }
  if (config.maxClients !== undefined) {
    body.maxassoc = config.maxClients;
    delete body.maxClients;
  }
  if (config.password !== undefined) {
    body.key = config.password;
    delete body.password;
  }

  await fetch(`${baseUrl}/api/network/wireless`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

export async function getWifiClients(baseUrl: string, token: string): Promise<WifiClient[]> {
  const response = await fetch(`${baseUrl}/api/network/wireless/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json();
  const items: Array<Record<string, unknown>> = json.data;

  return items.map((item) => ({
    mac: item.mac as string,
    ip: item.ip as string,
    hostname: item.hostname as string,
    signal: item.signal as number,
    txBytes: item.tx_bytes as number,
    rxBytes: item.rx_bytes as number,
    connectedSince: item.connected_time as string,
  }));
}

export async function getWifiTraffic(baseUrl: string, token: string): Promise<WifiTraffic> {
  const response = await fetch(`${baseUrl}/api/interfaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json();
  const data = json.data as Record<string, Record<string, number>>;
  const ifaceName = Object.keys(data).find((k) => k.startsWith("wlan")) ?? Object.keys(data)[0];
  const iface = data[ifaceName];

  return {
    interface: ifaceName,
    txBytes: iface.tx_bytes,
    rxBytes: iface.rx_bytes,
    txPackets: iface.tx_packets,
    rxPackets: iface.rx_packets,
    timestamp: new Date().toISOString(),
  };
}

export const getRutApiUrl = (info: DeviceInformation): string =>
  `http://${info.host}:${info.rutApiPort ?? 80}`;

export const getRutApiCredentials = (info: DeviceInformation): { user: string; password: string } => ({
  user: info.rutApiUser ?? info.user,
  password: info.rutApiPassword ?? info.password,
});

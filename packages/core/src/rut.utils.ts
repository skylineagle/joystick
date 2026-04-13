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

async function loginJrpc(baseUrl: string, username: string, password: string): Promise<string> {
  const response = await fetch(`${baseUrl}/ubus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "call",
      params: ["00000000000000000000000000000000", "session", "login", { username, password }],
    }),
  });

  const json = await response.json();

  if (json.result[0] !== 0) {
    throw new Error("Failed to authenticate with device JSON-RPC");
  }

  return json.result[1].ubus_rpc_session as string;
}

async function jrpcCall<T>(
  baseUrl: string,
  session: string,
  service: string,
  method: string,
  params: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${baseUrl}/ubus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "call",
      params: [session, service, method, params],
    }),
  });

  const json = await response.json();

  if (json.result[0] !== 0) {
    throw new Error(`JSON-RPC call failed: ${service}.${method}`);
  }

  return json.result[1] as T;
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

export async function getWifiStatus(
  baseUrl: string,
  username: string,
  password: string
): Promise<WifiApStatus> {
  const session = await loginJrpc(baseUrl, username, password);

  const data = await jrpcCall<{
    mode: string;
    ssid: string;
    channel: number;
    frequency: number;
    txpower: number;
    encryption: { enabled: boolean; method?: string };
  }>(baseUrl, session, "iwinfo", "info", { device: "radio0" });

  return {
    enabled: data.mode === "Master",
    ssid: data.ssid,
    channel: data.channel,
    band: data.frequency >= 5000 ? "5GHz" : "2.4GHz",
    frequency: data.frequency,
    txPower: data.txpower,
    security: data.encryption.method ?? (data.encryption.enabled ? "psk2" : "none"),
    clientCount: 0,
  };
}

export async function getWifiConfig(
  baseUrl: string,
  username: string,
  password: string
): Promise<WifiApConfig> {
  const token = await login(baseUrl, username, password);

  const response = await fetch(`${baseUrl}/api/wireless/config`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json();
  const items = json.data as Array<{
    id: string;
    ssid: string;
    key?: string;
    encryption: string;
    maxassoc?: string;
    hidden: string;
    mode: string;
  }>;

  const item = items.find((i) => i.mode === "ap") ?? items[0];

  return {
    ssid: item.ssid,
    password: item.key ?? "",
    channel: 0,
    band: "",
    security: item.encryption as "none" | "psk" | "psk2",
    txPower: 0,
    maxClients: parseInt(item.maxassoc ?? "32"),
    hidden: item.hidden === "1",
  };
}

export async function setWifiConfig(
  baseUrl: string,
  username: string,
  password: string,
  config: Partial<WifiApConfig>
): Promise<void> {
  const token = await login(baseUrl, username, password);

  const listResponse = await fetch(`${baseUrl}/api/wireless/config`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const listJson = await listResponse.json();
  const items = listJson.data as Array<{ id: string; mode: string }>;
  const item = items.find((i) => i.mode === "ap") ?? items[0];

  const body: Record<string, string> = {};

  if (config.ssid !== undefined) body.ssid = config.ssid;
  if (config.password !== undefined) body.key = config.password;
  if (config.security !== undefined) body.encryption = config.security;
  if (config.maxClients !== undefined) body.maxassoc = String(config.maxClients);
  if (config.hidden !== undefined) body.hidden = config.hidden ? "1" : "0";

  await fetch(`${baseUrl}/api/wireless/config/${item.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: body }),
  });
}

export async function getWifiClients(
  baseUrl: string,
  username: string,
  password: string
): Promise<WifiClient[]> {
  const session = await loginJrpc(baseUrl, username, password);

  const assoc = await jrpcCall<{
    results: Array<{ mac: string; signal: number; inactive: number }>;
  }>(baseUrl, session, "iwinfo", "assoclist", { device: "wlan0" });

  const arp = await jrpcCall<{ code: number; stdout: string }>(
    baseUrl,
    session,
    "file",
    "exec",
    { command: "cat", params: ["/proc/net/arp"] }
  );

  const macToIp = new Map<string, string>();
  const arpLines = arp.stdout.split("\n").slice(1);
  for (const line of arpLines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 4) {
      macToIp.set(parts[3].toLowerCase(), parts[0]);
    }
  }

  return assoc.results.map((item) => ({
    mac: item.mac,
    ip: macToIp.get(item.mac.toLowerCase()) ?? "",
    hostname: "",
    signal: item.signal,
    txBytes: 0,
    rxBytes: 0,
    connectedSince: String(item.inactive),
  }));
}

export async function getWifiTraffic(
  baseUrl: string,
  username: string,
  password: string
): Promise<WifiTraffic> {
  const session = await loginJrpc(baseUrl, username, password);

  const result = await jrpcCall<{ code: number; stdout: string }>(
    baseUrl,
    session,
    "file",
    "exec",
    { command: "cat", params: ["/proc/net/dev"] }
  );

  const lines = result.stdout.split("\n").slice(2);
  const wlanLine = lines.find((l) => l.trim().startsWith("wlan0:"));

  if (!wlanLine) {
    throw new Error("wlan0 interface not found in /proc/net/dev");
  }

  const parts = wlanLine.trim().replace("wlan0:", "").trim().split(/\s+/);
  const rxBytes = parseInt(parts[0]);
  const rxPackets = parseInt(parts[1]);
  const txBytes = parseInt(parts[8]);
  const txPackets = parseInt(parts[9]);

  return {
    interface: "wlan0",
    rxBytes,
    rxPackets,
    txBytes,
    txPackets,
    timestamp: new Date().toISOString(),
  };
}

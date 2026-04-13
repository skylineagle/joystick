import { RUT_MOCK_PORT } from "../constants";

type WifiState = {
  id: string;
  ssid: string;
  key: string;
  encryption: string;
  maxassoc: string;
  hidden: string;
  disabled: string;
  mode: string;
  device: string;
  network: string;
};

const wifiState: WifiState = {
  id: "default_radio0",
  ssid: "MockAP-RUT950",
  key: "mockpass1",
  encryption: "psk2",
  maxassoc: "32",
  hidden: "0",
  disabled: "0",
  mode: "ap",
  device: "radio0",
  network: "lan",
};

let radioState = {
  phy: "phy0",
  ssid: "MockAP-RUT950",
  bssid: "00:1E:42:AA:BB:CC",
  country: "00",
  mode: "Master",
  channel: 6,
  frequency: 2437,
  txpower: 20,
  quality: 55,
  quality_max: 70,
  signal: 0,
  noise: -90,
  bitrate: 72200,
  encryption: { enabled: true, method: "psk2" },
  hwmodes: ["b", "g", "n"],
  hardware: { name: "Generic MAC80211" },
};

const mockAssocList = [
  {
    mac: "AA:BB:CC:11:22:33",
    signal: -45,
    noise: -90,
    inactive: 1200,
    rx: { rate: 54000, mcs: 5, "40mhz": false, short_gi: false },
    tx: { rate: 72200, mcs: 7, "40mhz": false, short_gi: true },
  },
  {
    mac: "DD:EE:FF:44:55:66",
    signal: -62,
    noise: -90,
    inactive: 8400,
    rx: { rate: 24000, mcs: 3, "40mhz": false, short_gi: false },
    tx: { rate: 54000, mcs: 5, "40mhz": false, short_gi: true },
  },
  {
    mac: "11:22:33:AA:BB:CC",
    signal: -71,
    noise: -90,
    inactive: 500,
    rx: { rate: 12000, mcs: 1, "40mhz": false, short_gi: false },
    tx: { rate: 24000, mcs: 3, "40mhz": false, short_gi: true },
  },
];

const arpTable =
  "IP address       HW type     Flags       HW address            Mask     Device\n" +
  "192.168.1.101    0x1         0x2         aa:bb:cc:11:22:33     *        br-lan\n" +
  "192.168.1.102    0x1         0x2         dd:ee:ff:44:55:66     *        br-lan\n" +
  "192.168.1.103    0x1         0x2         11:22:33:aa:bb:cc     *        br-lan\n";

let trafficBase = { rx: 5242880, tx: 2621440, rxp: 50000, txp: 30000 };

const handleRequest = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/ubus" && req.method === "POST") {
    const body = (await req.json()) as {
      params: [string, string, string, Record<string, unknown>];
    };
    const [, service, method, params] = body.params;

    if (service === "session" && method === "login") {
      return Response.json({
        jsonrpc: "2.0",
        id: 1,
        result: [0, { ubus_rpc_session: "mock-session-rut950", timeout: 300 }],
      });
    }

    if (service === "iwinfo" && method === "info") {
      return Response.json({
        jsonrpc: "2.0",
        id: 1,
        result: [0, { ...radioState, ssid: wifiState.ssid }],
      });
    }

    if (service === "iwinfo" && method === "assoclist") {
      return Response.json({
        jsonrpc: "2.0",
        id: 1,
        result: [0, { results: mockAssocList }],
      });
    }

    if (service === "file" && method === "exec") {
      const command = params.command as string;
      const execParams = (params.params as string[]) ?? [];

      if (command === "cat" && execParams[0] === "/proc/net/arp") {
        return Response.json({
          jsonrpc: "2.0",
          id: 1,
          result: [0, { code: 0, stdout: arpTable }],
        });
      }

      if (command === "cat" && execParams[0] === "/proc/net/dev") {
        trafficBase.rx += Math.floor(Math.random() * 50000);
        trafficBase.tx += Math.floor(Math.random() * 25000);
        trafficBase.rxp += Math.floor(Math.random() * 50);
        trafficBase.txp += Math.floor(Math.random() * 25);
        const devContent =
          "Inter-|   Receive                                                |  Transmit\n" +
          " face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed\n" +
          `    lo:       0       0    0    0    0     0          0         0        0       0    0    0    0     0       0          0\n` +
          ` wlan0: ${trafficBase.rx} ${trafficBase.rxp}    0    0    0     0          0         0 ${trafficBase.tx} ${trafficBase.txp}    0    0    0     0       0          0\n`;
        return Response.json({
          jsonrpc: "2.0",
          id: 1,
          result: [0, { code: 0, stdout: devContent }],
        });
      }
    }

    return Response.json({ jsonrpc: "2.0", id: 1, result: [6, null] });
  }

  if (path === "/api/login" && req.method === "POST") {
    return Response.json({ success: true, data: { token: "mock-rest-token-rut950" } });
  }

  if (path === "/api/wireless/config" && req.method === "GET") {
    return Response.json({ success: true, data: [{ ...wifiState }] });
  }

  if (req.method === "PUT" && path.startsWith("/api/wireless/config/")) {
    const updates = ((await req.json()) as { data: Partial<WifiState> }).data;
    Object.assign(wifiState, updates);
    if (updates.ssid) radioState.ssid = updates.ssid;
    return Response.json({ success: true, data: { ...wifiState } });
  }

  return new Response("Not found", { status: 404 });
};

Bun.serve({
  port: RUT_MOCK_PORT,
  fetch: handleRequest,
});

console.log(`RUT950 mock running on port ${RUT_MOCK_PORT}`);

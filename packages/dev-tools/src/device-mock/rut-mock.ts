import { RUT_MOCK_PORT } from "../constants";

type WifiState = {
  enabled: boolean;
  ssid: string;
  key: string;
  channel: number;
  band: string;
  frequency: number;
  txpower: number;
  encryption: string;
  maxassoc: number;
  hidden: boolean;
};

const state: WifiState = {
  enabled: true,
  ssid: "MockAP-RUT950",
  key: "mockpass1",
  channel: 6,
  band: "2.4GHz",
  frequency: 2437,
  txpower: 20,
  encryption: "psk2",
  maxassoc: 32,
  hidden: false,
};

let trafficCounter = { tx: 0, rx: 0, txp: 0, rxp: 0 };

const mockClients = [
  { mac: "AA:BB:CC:11:22:33", ip: "192.168.1.101", hostname: "phone-1", signal: -55, tx_bytes: 1048576, rx_bytes: 524288, connected_time: "0:15:32" },
  { mac: "DD:EE:FF:44:55:66", ip: "192.168.1.102", hostname: "laptop-dev", signal: -67, tx_bytes: 5242880, rx_bytes: 2621440, connected_time: "1:02:45" },
  { mac: "11:22:33:AA:BB:CC", ip: "192.168.1.103", hostname: "tablet-1", signal: -72, tx_bytes: 262144, rx_bytes: 131072, connected_time: "0:08:11" },
];

const handleRequest = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/api/login" && req.method === "POST") {
    return Response.json({ success: true, data: { token: "mock-token-rut950" } });
  }

  if (path === "/api/network/wireless" && req.method === "GET") {
    return Response.json({ success: true, data: { ...state } });
  }

  if (path === "/api/network/wireless" && req.method === "PUT") {
    const body = await req.json();
    Object.assign(state, body);
    return Response.json({ success: true, data: { ...state } });
  }

  if (path === "/api/network/wireless/clients" && req.method === "GET") {
    return Response.json({ success: true, data: mockClients });
  }

  if (path === "/api/interfaces" && req.method === "GET") {
    trafficCounter.tx += Math.floor(Math.random() * 50000);
    trafficCounter.rx += Math.floor(Math.random() * 100000);
    trafficCounter.txp += Math.floor(Math.random() * 50);
    trafficCounter.rxp += Math.floor(Math.random() * 100);
    return Response.json({
      success: true,
      data: {
        wlan0: {
          tx_bytes: trafficCounter.tx + 10485760,
          rx_bytes: trafficCounter.rx + 5242880,
          tx_packets: trafficCounter.txp + 10000,
          rx_packets: trafficCounter.rxp + 20000,
        },
      },
    });
  }

  return new Response("Not found", { status: 404 });
};

Bun.serve({
  port: RUT_MOCK_PORT,
  fetch: handleRequest,
});

console.log(`RUT950 mock running on port ${RUT_MOCK_PORT}`);

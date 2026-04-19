import PocketBase from "pocketbase";
import type { DeviceInformation } from "../../../core/src/types/index.ts";
import { RunTargetOptions, ModelsStreamOptions, DevicesStatusOptions } from "../../../core/src/types/db.types.ts";
import {
  DEFAULT_POCKETBASE_URL,
  MOCK_SSH_USER,
  MOCK_SSH_PASSWORD,
  RUT_MOCK_PORT,
} from "../constants.ts";

const pbUrl = process.env.POCKETBASE_URL ?? DEFAULT_POCKETBASE_URL;
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL ?? "admin@joystick.io";
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD ?? "Aa123456";

const pb = new PocketBase(pbUrl);

const ensureActionByName = async (name: string) => {
  try {
    return await pb.collection("actions").getFirstListItem(`name="${name}"`);
  } catch {
    return await pb.collection("actions").create({ name });
  }
};

const ensureModelByName = async (name: string, body: Record<string, unknown>) => {
  try {
    const existing = await pb.collection("models").getFirstListItem(`name="${name}"`);
    await pb.collection("models").update(existing.id, body);
    return existing;
  } catch {
    return await pb.collection("models").create(body);
  }
};

const ensureDeviceByName = async (name: string, body: Record<string, unknown>) => {
  try {
    const existing = await pb.collection("devices").getFirstListItem(`name="${name}"`);
    await pb.collection("devices").update(existing.id, body);
    return existing;
  } catch {
    return await pb.collection("devices").create(body);
  }
};

const ensureRun = async (
  modelId: string,
  actionId: string,
  body: Record<string, unknown>
) => {
  try {
    const existing = await pb.collection("run").getFirstListItem(
      `device="${modelId}" && action="${actionId}"`
    );
    await pb.collection("run").update(existing.id, body);
    return existing;
  } catch {
    return await pb.collection("run").create({
      ...body,
      device: modelId,
      action: actionId,
    });
  }
};

const modeLabels = {
  live: {
    label: "Live Stream",
    icon: "video",
    description: "Camera is actively streaming",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "hover:bg-green-500/10 focus:bg-green-500/10",
  },
  off: {
    label: "Offline",
    icon: "ban",
    description: "Camera is turned off",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    hoverColor: "hover:bg-slate-500/10 focus:bg-slate-500/10",
  },
  auto: {
    label: "Automated",
    icon: "clock",
    description: "Camera follows automated schedule",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "hover:bg-blue-500/10 focus:bg-blue-500/10",
  },
} as const;

const paramsSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Streaming Configuration",
  type: "object",
  properties: {
    video: {
      type: "object",
      properties: {
        fps: { type: "number", minimum: 1, maximum: 240 },
        bitrate: { type: "integer", minimum: 10000 },
        resolution: { type: "string", pattern: "^\\d{3,5}x\\d{3,5}$" },
      },
      required: ["fps", "bitrate"],
    },
    connection: {
      type: "object",
      properties: {
        host: { type: "string" },
        ip: { type: "string" },
        port: { type: "integer", minimum: 1, maximum: 65535 },
      },
      required: ["ip", "port"],
    },
  },
  required: ["video", "connection"],
};

const streamQuality = {
  "1080p30": {
    excellent: 8000000,
    good: 6000000,
    fair: 4000000,
    poor: 2000000,
  },
  "720p30": {
    excellent: 5000000,
    good: 3500000,
    fair: 2500000,
    poor: 1500000,
  },
};

const tempLevels = {
  cool: { min: 0, max: 35, color: "#0ea5e9", status: "Cool" },
  normal: { min: 35, max: 55, color: "#22c55e", status: "Normal" },
  warm: { min: 55, max: 70, color: "#eab308", status: "Warm" },
  hot: { min: 70, max: 100, color: "#ef4444", status: "Hot" },
};

const rutInformation: DeviceInformation = {
  user: MOCK_SSH_USER,
  password: MOCK_SSH_PASSWORD,
  key: "",
  host: "127.0.0.1",
  port: 50224,
  rutApiPort: RUT_MOCK_PORT,
  phone: "15550009001",
  activeSlot: "primary",
  secondSlotHost: "127.0.0.1",
  secondSlotPhone: "15550009002",
  battery_capacity: 5000,
  battery_factor: 1,
  harvest: { supportedTypes: ["image"], interval: 120, autoPull: false },
  imuResetValues: { x: 0, y: 0, z: 0 },
  bitrate_presets: { low: 2000000, med: 5000000, high: 8000000 },
  fps_presets: { film: 24, ntsc: 30, high: 60 },
  quality_presets: {
    hd: { bitrate: 5000000, fps: 30 },
    sd: { bitrate: 2500000, fps: 24 },
  },
};

const rutModelRecord = {
  name: "Mock RUT950",
  params: paramsSchema,
  mode_configs: { off: modeLabels.off, live: modeLabels.live, auto: modeLabels.auto },
  stream_quality: streamQuality,
  temp_levels: tempLevels,
  stream: ModelsStreamOptions.mediamtx,
  isAudio: false,
};

const rutDeviceRecord = (modelId: string) => ({
  name: "dev-mock-rut950-01",
  device: modelId,
  status: DevicesStatusOptions.on,
  mode: "off",
  allow: [] as string[],
  auto: false,
  automation: {
    automationType: "duration",
    off: { minutes: 2, mode: "off" },
    on: { minutes: 5, mode: "live" },
  },
  configuration: {
    name: "dev-mock-rut950-01",
    source: "rtsp://127.0.0.1:8554/mock-rut950",
    fallback: "",
    maxReaders: 0,
    overridePublisher: true,
    record: false,
    recordDeleteAfter: "0s",
    recordFormat: "fmp4",
    recordPartDuration: "1s",
    recordPath: "/recordings/%path/%Y-%m-%d_%H-%M-%S-%f",
    recordSegmentDuration: "5m0s",
    rpiCameraBitrate: 5000000,
    rpiCameraFPS: 30,
    rpiCameraHeight: 1080,
    rpiCameraWidth: 1920,
    rtspTransport: "tcp",
    runOnDemand: "",
    runOnDemandCloseAfter: "10s",
    runOnDemandRestart: false,
    runOnDemandStartTimeout: "10s",
    runOnInit: "",
    runOnInitRestart: false,
    runOnNotReady: "",
    runOnRead: "",
    runOnReadRestart: false,
    runOnReady: "",
    runOnReadyRestart: false,
    sourceOnDemand: false,
    sourceOnDemandCloseAfter: "10s",
    sourceOnDemandStartTimeout: "10s",
  },
  description: "Teltonika RUT950 mock with WiFi AP management support.",
  hide: false,
  information: rutInformation,
});

type RutRunSeed = {
  actionName: string;
  command: string;
  target: RunTargetOptions;
};

const rutRunSeeds: RutRunSeed[] = [
  { actionName: "get-wifi-ap-status", command: "GET /api/wifi-ap/$device/status", target: RunTargetOptions.joystick },
  { actionName: "get-wifi-clients", command: "GET /api/wifi-ap/$device/clients", target: RunTargetOptions.joystick },
  { actionName: "get-wifi-traffic", command: "GET /api/wifi-ap/$device/traffic", target: RunTargetOptions.joystick },
  { actionName: "set-wifi-ap-config", command: "PUT /api/wifi-ap/$device/config", target: RunTargetOptions.joystick },
  { actionName: "healthcheck", command: "echo true", target: RunTargetOptions.device },
  { actionName: "set-mode", command: `echo '{"ok":true,"mode":"$mode"}'`, target: RunTargetOptions.device },
  { actionName: "get-battery", command: `echo '{"voltage":3.95,"current":140,"power":553,"consumption":420}'`, target: RunTargetOptions.device },
  { actionName: "get-cpsi", command: `echo '{"technology":"LTE","status":"online","cellId":"00AB01","operator":"MockNet","mccMnc":"310260","band":"B2","rssi":-71,"rsrp":-95,"rsrq":-12,"sinr":8}'`, target: RunTargetOptions.device },
  { actionName: "get-temp", command: `echo '{"temperature":42.1,"unit":"°C"}'`, target: RunTargetOptions.device },
];

const main = async () => {
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);

  const actionIds = new Map<string, string>();
  const actionNames = [...new Set(rutRunSeeds.map((r) => r.actionName))];
  for (const name of actionNames) {
    const rec = await ensureActionByName(name);
    actionIds.set(name, rec.id);
  }

  const model = await ensureModelByName("Mock RUT950", rutModelRecord);
  await ensureDeviceByName("dev-mock-rut950-01", rutDeviceRecord(model.id));

  for (const runSeed of rutRunSeeds) {
    const actionId = actionIds.get(runSeed.actionName);
    if (!actionId) continue;

    await ensureRun(model.id, actionId, {
      command: runSeed.command,
      parameters: null,
      target: runSeed.target,
    });
  }

  console.log("RUT seed finished. Model: Mock RUT950, Device: dev-mock-rut950-01");
  pb.authStore.clear();
};

await main();

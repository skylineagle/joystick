import type {
  DeviceAutomation,
  DeviceConfiguration,
  DeviceInformation,
} from "../../../core/src/types/index.ts";
import {
  DEV_MODEL_PORTS,
  MOCK_SSH_PASSWORD,
  MOCK_SSH_USER,
  type DevModelKey,
} from "../constants.ts";
import {
  DevicesStatusOptions,
  ModelsStreamOptions,
  RunTargetOptions,
} from "../../../core/src/types/db.types.ts";

export const modeLabels = {
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
  "live-day": {
    label: "Live Day",
    icon: "sun",
    description: "Using the day preset",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    hoverColor: "hover:bg-yellow-500/10 focus:bg-yellow-500/10",
  },
  "live-night": {
    label: "Live Night",
    icon: "moon",
    description: "Using the night preset",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    hoverColor: "hover:bg-indigo-500/10 focus:bg-indigo-500/10",
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

const baseConfiguration = (
  name: string,
  source: string,
): DeviceConfiguration => ({
  name,
  source,
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
});

const baseAutomation: DeviceAutomation = {
  automationType: "duration",
  off: { minutes: 2, mode: "off" },
  on: { minutes: 5, mode: "live" },
};

const mockInformation = (
  port: number,
  extra?: Partial<DeviceInformation>,
): DeviceInformation => ({
  user: MOCK_SSH_USER,
  password: MOCK_SSH_PASSWORD,
  key: "",
  host: "127.0.0.1",
  port,
  phone: "15550001001",
  activeSlot: "primary",
  secondSlotHost: "127.0.0.1",
  secondSlotPhone: "15550001002",
  battery_capacity: 10000,
  battery_factor: 1,
  harvest: {
    supportedTypes: ["image", "video"],
    interval: 120,
    autoPull: false,
  },
  imuResetValues: { x: 0, y: 0, z: 0 },
  bitrate_presets: { low: 2000000, med: 5000000, high: 8000000 },
  fps_presets: { film: 24, ntsc: 30, high: 60 },
  quality_presets: {
    hd: { bitrate: 5000000, fps: 30 },
    sd: { bitrate: 2500000, fps: 24 },
  },
  ...extra,
});

export type DevModelSeed = {
  key: DevModelKey;
  modelName: string;
  deviceName: string;
  description: string;
  stream: ModelsStreamOptions;
  isAudio: boolean;
  modes: (keyof typeof modeLabels)[];
  source: string;
  informationExtra?: Partial<DeviceInformation>;
};

export const devModelSeeds: DevModelSeed[] = [
  {
    key: "mock-pi",
    modelName: "Mock Raspberry Pi / mediamtx",
    deviceName: "dev-mock-pi-01",
    description:
      "Bench device with day/night presets and mediamtx streaming defaults.",
    stream: ModelsStreamOptions.mediamtx,
    isAudio: true,
    modes: ["off", "live", "live-day", "live-night", "auto"],
    source: "rtsp://127.0.0.1:8554/mock-pi",
  },
  {
    key: "mock-jetson",
    modelName: "Mock Jetson / mediamtx",
    deviceName: "dev-mock-jetson-01",
    description: "Edge AI style device with core streaming modes.",
    stream: ModelsStreamOptions.mediamtx,
    isAudio: false,
    modes: ["off", "live", "auto"],
    source: "rtsp://127.0.0.1:8554/mock-jetson",
  },
  {
    key: "mock-lte",
    modelName: "Mock LTE field unit / WebSocket",
    deviceName: "dev-mock-lte-01",
    description: "Lower-power field unit using ws streaming profile.",
    stream: ModelsStreamOptions.ws,
    isAudio: false,
    modes: ["off", "live", "auto"],
    source: "rtsp://127.0.0.1:8554/mock-lte",
  },
];

export const buildModeConfigs = (modes: DevModelSeed["modes"]) => {
  const o: Record<string, (typeof modeLabels)[keyof typeof modeLabels]> = {};
  for (const m of modes) {
    o[m] = modeLabels[m];
  }
  return o;
};

export const buildModelRecord = (seed: DevModelSeed) => ({
  name: seed.modelName,
  params: paramsSchema,
  mode_configs: buildModeConfigs(seed.modes),
  stream_quality: streamQuality,
  temp_levels: tempLevels,
  stream: seed.stream,
  isAudio: seed.isAudio,
});

export const buildDeviceRecord = (seed: DevModelSeed, modelId: string) => ({
  name: seed.deviceName,
  device: modelId,
  status: DevicesStatusOptions.on,
  mode: seed.modes[0] ?? "off",
  allow: [] as string[],
  auto: false,
  automation: baseAutomation,
  configuration: baseConfiguration(seed.deviceName, seed.source),
  description: seed.description,
  hide: false,
  information: mockInformation(
    DEV_MODEL_PORTS[seed.key],
    seed.informationExtra,
  ),
});

export type RunSeed = {
  actionName: string;
  command: string;
  parameters: Record<string, unknown> | null;
  target: RunTargetOptions;
};

export const devRunSeeds: RunSeed[] = [
  {
    actionName: "set-mode",
    command: `echo '{"ok":true,"mode":"$mode"}'`,
    parameters: {
      type: "object",
      properties: {
        mode: { type: "string", enum: [] as string[] },
      },
      required: ["mode"],
    },
    target: RunTargetOptions.device,
  },
  {
    actionName: "healthcheck",
    command: "echo true",
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-battery",
    command: `echo '{"voltage":3.95,"current":140,"power":553,"consumption":420}'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-gps",
    command: `echo '{"latitude":37.7749,"longitude":-122.4194,"altitude":18,"accuracy":3}'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-imu",
    command: `echo '{"x":0.02,"y":-0.01,"z":0.99}'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-cpsi",
    command: `echo '{"technology":"LTE","status":"online","cellId":"00AB01","operator":"MockNet","mccMnc":"310260","band":"B2","rssi":-71,"rsrp":-95,"rsrq":-12,"sinr":8}'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-temp",
    command: `echo '{"temperature":46.2,"unit":"°C"}'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-fps",
    command: "echo 30",
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "set-fps",
    command: "echo $fps",
    parameters: {
      type: "object",
      properties: { fps: { type: "number" } },
      required: ["fps"],
    },
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-bitrate",
    command: "echo 5000000",
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "set-bitrate",
    command: "echo $bitrate",
    parameters: {
      type: "object",
      properties: { bitrate: { type: "number" } },
      required: ["bitrate"],
    },
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-quality",
    command: `echo '{"quality":2,"label":"hd","bitrate":5000000,"fps":30}'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "set-quality",
    command: "echo $quality",
    parameters: {
      type: "object",
      properties: { quality: { type: "number" } },
      required: ["quality"],
    },
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-roi",
    command: `echo '[{"x1":0.12,"x2":0.88,"y1":0.1,"y2":0.9}]'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "set-roi",
    command: "echo ok",
    parameters: {
      type: "object",
      properties: {
        rois: {
          type: "array",
          items: {
            type: "object",
            properties: {
              x1: { type: "number" },
              x2: { type: "number" },
              y1: { type: "number" },
              y2: { type: "number" },
            },
          },
        },
      },
      required: ["rois"],
    },
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-services-status",
    command: `echo '[{"name":"mediamtx","status":"running","uptime":"2h","memory":"96MB","cpu":"6%"},{"name":"mock-agent","status":"running","uptime":"2h","memory":"22MB","cpu":"1%"}]'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "run-scan",
    command: `echo '{"started":true}'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
  {
    actionName: "get-scan",
    command: `echo '[{"id":"mockcell00001","operator":"MockNet","operatorId":"310260","tech":"LTE","arfcn":1200,"band":"B2","frequency":1960,"pci":42,"tac":12345,"cellIdHex":"01AB","cellIdDec":"427","rsrp":-90,"rsrq":-10}]'`,
    parameters: null,
    target: RunTargetOptions.device,
  },
];

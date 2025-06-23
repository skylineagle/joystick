import {
  type ActionsResponse,
  type DeviceAutomation,
  type DeviceConfiguration,
  type DeviceInformation,
  type DevicesRecord,
  type ModelModeConfigs,
  type ModelsResponse,
  type ModelStreamQulity,
  type PermissionsResponse,
  type RunResponse,
  type UsersResponse,
} from "@joystick/core";
import {
  DevicesStatusOptions,
  ModelsStreamOptions,
  RunTargetOptions,
} from "../../src/types/db.types";

export const TEST_USERS: Record<
  "admin" | "user" | "limited",
  Partial<UsersResponse> & { passwordConfirm: string; permissions: string[] }
> = {
  admin: {
    id: "testuser0000001",
    email: "test-admin@joystick.io",
    password: "admin123",
    passwordConfirm: "admin123",
    verified: true,
    name: "Admin User",
    permissions: ["*"],
  },
  user: {
    id: "testuser0000002",
    email: "test-user@joystick.io",
    password: "Aa123456",
    passwordConfirm: "Aa123456",
    verified: true,
    name: "Regular User",
    permissions: ["control-device", "media-route", "action-route"],
  },
  limited: {
    id: "testuser0000003",
    email: "test-limited@joystick.io",
    password: "limited123",
    passwordConfirm: "limited123",
    verified: true,
    name: "Limited User",
    permissions: ["media-route"],
  },
};

export const TEST_MODELS: Record<
  "model1" | "model2",
  Omit<
    ModelsResponse<ModelModeConfigs, unknown, ModelStreamQulity>,
    "collectionId" | "collectionName" | "created" | "updated"
  >
> = {
  model1: {
    id: "testmodel000001",
    name: "Test Device Model",
    params: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Streaming Configuration",
      type: "object",
      properties: {
        video: {
          type: "object",
          properties: {
            fps: {
              type: "number",
              minimum: 1,
              maximum: 240,
              description: "Frames per second",
            },
            bitrate: {
              type: "integer",
              minimum: 10000,
              description: "Bitrate in bits per second",
            },
            resolution: {
              type: "string",
              pattern: "^\\d{3,5}x\\d{3,5}$",
              description: "Video resolution in WIDTHxHEIGHT format",
            },
          },
          required: ["fps", "bitrate"],
        },
        connection: {
          type: "object",
          properties: {
            host: {
              type: "string",
              format: "hostname",
              description: "Streaming server hostname",
            },
            ip: {
              type: "string",
              format: "ipv4",
              description: "IP address of the connection target",
            },
            port: {
              type: "integer",
              minimum: 1,
              maximum: 65535,
              description: "Port number",
            },
          },
          required: ["ip", "port"],
        },
      },
      required: ["video", "connection"],
    },
    mode_configs: {},
    stream_quality: {},
    stream: ModelsStreamOptions.mediamtx,
  },
  model2: {
    id: "testmodel000002",
    name: "Test Device Model 2",
    params: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Streaming Configuration",
      type: "object",
      properties: {
        video: {
          type: "object",
          properties: {
            fps: {
              type: "number",
              minimum: 1,
              maximum: 240,
              description: "Frames per second",
            },
            bitrate: {
              type: "integer",
              minimum: 10000,
              description: "Bitrate in bits per second",
            },
            resolution: {
              type: "string",
              pattern: "^\\d{3,5}x\\d{3,5}$",
              description: "Video resolution in WIDTHxHEIGHT format",
            },
          },
          required: ["fps", "bitrate"],
        },
        connection: {
          type: "object",
          properties: {
            host: {
              type: "string",
              format: "hostname",
              description: "Streaming server hostname",
            },
            ip: {
              type: "string",
              format: "ipv4",
              description: "IP address of the connection target",
            },
            port: {
              type: "integer",
              minimum: 1,
              maximum: 65535,
              description: "Port number",
            },
          },
          required: ["ip", "port"],
        },
      },
      required: ["video", "connection"],
    },
    mode_configs: {},
    stream_quality: {},
    stream: ModelsStreamOptions.mediamtx,
  },
};

export const TEST_DEVICES: Record<
  "device1" | "device2",
  Omit<
    DevicesRecord<DeviceAutomation, DeviceConfiguration, DeviceInformation>,
    "collectionId" | "collectionName" | "created" | "updated"
  >
> = {
  device1: {
    id: "testdevice00001",
    name: "device1",
    device: TEST_MODELS.model1.id,
    status: DevicesStatusOptions.on,
    mode: "off",
    allow: [],
    auto: false,
    automation: {
      automationType: "duration",
      off: {
        minutes: 1,
        mode: "off",
      },
      on: {
        minutes: 4,
        mode: "live",
      },
    },
    configuration: {
      fallback: "",
      maxReaders: 0,
      name: "device1",
      overridePublisher: true,
      record: true,
      recordDeleteAfter: "0s",
      recordFormat: "fmp4",
      recordPartDuration: "1s",
      recordPath: "/recordings/%path/%Y-%m-%d_%H-%M-%S-%f",
      recordSegmentDuration: "5m0s",
      rpiCameraAWB: "auto",
      rpiCameraAWBGains: [0, 0],
      rpiCameraAfMode: "continuous",
      rpiCameraAfRange: "normal",
      rpiCameraAfSpeed: "normal",
      rpiCameraAfWindow: "",
      rpiCameraBitrate: 5000000,
      rpiCameraBrightness: 0,
      rpiCameraCamID: 0,
      rpiCameraCodec: "auto",
      rpiCameraContrast: 1,
      rpiCameraDenoise: "off",
      rpiCameraEV: 0,
      rpiCameraExposure: "normal",
      rpiCameraFPS: 30,
      rpiCameraFlickerPeriod: 0,
      rpiCameraGain: 0,
      rpiCameraHDR: false,
      rpiCameraHFlip: false,
      rpiCameraHeight: 1080,
      rpiCameraIDRPeriod: 60,
      rpiCameraLensPosition: 0,
      rpiCameraLevel: "4.1",
      rpiCameraMetering: "centre",
      rpiCameraMode: "",
      rpiCameraProfile: "main",
      rpiCameraROI: "",
      rpiCameraSaturation: 1,
      rpiCameraSharpness: 1,
      rpiCameraShutter: 0,
      rpiCameraTextOverlay: "%Y-%m-%d %H:%M:%S - MediaMTX",
      rpiCameraTextOverlayEnable: false,
      rpiCameraTuningFile: "",
      rpiCameraVFlip: false,
      rpiCameraWidth: 1920,
      rtspAnyPort: false,
      rtspRangeStart: "",
      rtspRangeType: "",
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
      runOnRecordSegmentComplete: "",
      runOnRecordSegmentCreate: "",
      runOnUnDemand: "",
      runOnUnread: "",
      source: "rtsp://localhost:8554/mystream",
      sourceFingerprint: "",
      sourceOnDemand: false,
      sourceOnDemandCloseAfter: "10s",
      sourceOnDemandStartTimeout: "10s",
      sourceRedirect: "",
      srtPublishPassphrase: "",
      srtReadPassphrase: "",
    },
    description: "",
    hide: false,
    information: {
      user: "admin",
      password: "admin123",
      key: "admin123",
      host: "192.168.1.100",
      activeSlot: "primary",
      secondSlotHost: "192.168.1.101",
    },
  },
  device2: {
    id: "testdevice00002",
    name: "device2",
    device: TEST_MODELS.model2.id,
    status: DevicesStatusOptions.on,
    mode: "off",
    allow: [],
    auto: false,
    automation: {
      automationType: "duration",
      off: {
        minutes: 1,
        mode: "off",
      },
      on: {
        minutes: 4,
        mode: "live",
      },
    },
    configuration: {
      fallback: "",
      maxReaders: 0,
      name: "device2",
      overridePublisher: true,
      record: true,
      recordDeleteAfter: "0s",
      recordFormat: "fmp4",
      recordPartDuration: "1s",
      recordPath: "/recordings/%path/%Y-%m-%d_%H-%M-%S-%f",
      recordSegmentDuration: "5m0s",
      rpiCameraAWB: "auto",
      rpiCameraAWBGains: [0, 0],
      rpiCameraAfMode: "continuous",
      rpiCameraAfRange: "normal",
      rpiCameraAfSpeed: "normal",
      rpiCameraAfWindow: "",
      rpiCameraBitrate: 5000000,
      rpiCameraBrightness: 0,
      rpiCameraCamID: 0,
      rpiCameraCodec: "auto",
      rpiCameraContrast: 1,
      rpiCameraDenoise: "off",
      rpiCameraEV: 0,
      rpiCameraExposure: "normal",
      rpiCameraFPS: 30,
      rpiCameraFlickerPeriod: 0,
      rpiCameraGain: 0,
      rpiCameraHDR: false,
      rpiCameraHFlip: false,
      rpiCameraHeight: 1080,
      rpiCameraIDRPeriod: 60,
      rpiCameraLensPosition: 0,
      rpiCameraLevel: "4.1",
      rpiCameraMetering: "centre",
      rpiCameraMode: "",
      rpiCameraProfile: "main",
      rpiCameraROI: "",
      rpiCameraSaturation: 1,
      rpiCameraSharpness: 1,
      rpiCameraShutter: 0,
      rpiCameraTextOverlay: "%Y-%m-%d %H:%M:%S - MediaMTX",
      rpiCameraTextOverlayEnable: false,
      rpiCameraTuningFile: "",
      rpiCameraVFlip: false,
      rpiCameraWidth: 1920,
      rtspAnyPort: false,
      rtspRangeStart: "",
      rtspRangeType: "",
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
      runOnRecordSegmentComplete: "",
      runOnRecordSegmentCreate: "",
      runOnUnDemand: "",
      runOnUnread: "",
      source: "rtsp://localhost:8554/mystream2",
      sourceFingerprint: "",
      sourceOnDemand: false,
      sourceOnDemandCloseAfter: "10s",
      sourceOnDemandStartTimeout: "10s",
      sourceRedirect: "",
      srtPublishPassphrase: "",
      srtReadPassphrase: "",
    },
    description: "",
    hide: false,
    information: {
      user: "admin",
      password: "admin123",
      key: "admin123",
      host: "192.168.1.100",
      activeSlot: "secondary",
      secondSlotHost: "192.168.1.101",
    },
  },
};

export const TEST_ACTIONS: Record<
  "ping" | "updateMode" | "restart" | "shutdown",
  Omit<
    ActionsResponse,
    "collectionId" | "collectionName" | "created" | "updated"
  >
> = {
  ping: {
    id: "testaction00001",
    name: "ping",
  },
  updateMode: {
    id: "testaction00002",
    name: "update-mode",
  },
  restart: {
    id: "testaction00003",
    name: "restart",
  },
  shutdown: {
    id: "testaction00004",
    name: "shutdown",
  },
};

export const TEST_RUN: Record<
  "pingDevice1" | "setModeDevice1" | "restartDevice2" | "shutdownDevice2",
  Omit<RunResponse, "collectionId" | "collectionName" | "created" | "updated">
> = {
  pingDevice1: {
    id: "testrun00000001",
    action: TEST_ACTIONS.ping.id,
    device: TEST_MODELS.model1.id,
    command: "ping -c 1 192.168.1.100",
    parameters: null,
    target: RunTargetOptions.device,
  },
  setModeDevice1: {
    id: "testrun00000002",
    action: TEST_ACTIONS.updateMode.id,
    device: TEST_MODELS.model1.id,
    command: "echo 'set_mode auto'",
    parameters: {
      mode: "auto",
    },
    target: RunTargetOptions.device,
  },
  restartDevice2: {
    id: "testrun00000003",
    action: TEST_ACTIONS.restart.id,
    device: TEST_MODELS.model2.id,
    command: "echo 'restart'",
    parameters: null,
    target: RunTargetOptions.local,
  },
  shutdownDevice2: {
    id: "testrun00000004",
    action: TEST_ACTIONS.shutdown.id,
    device: TEST_MODELS.model2.id,
    command: "echo 'shutdown'",
    parameters: {
      force: false,
      delay: 0,
    },
    target: RunTargetOptions.device,
  },
};

export const TEST_PERMISSIONS: Record<
  "test-control-device" | "test-media-route" | "test-action-route",
  Omit<
    PermissionsResponse,
    "collectionId" | "collectionName" | "created" | "updated"
  >
> = {
  "test-control-device": {
    id: "testpermission1",
    name: "test-control-device",
    users: [TEST_USERS.admin.id!, TEST_USERS.user.id!, TEST_USERS.limited.id!],
  },
  "test-media-route": {
    id: "testpermission2",
    name: "test-media-route",
    users: [TEST_USERS.admin.id!, TEST_USERS.user.id!, TEST_USERS.limited.id!],
  },
  "test-action-route": {
    id: "testpermission3",
    name: "test-action-route",
    users: [TEST_USERS.admin.id!, TEST_USERS.user.id!],
  },
};

export type UserType = keyof typeof TEST_USERS;

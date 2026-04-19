export const MOCK_SSH_USER = "mock";
export const MOCK_SSH_PASSWORD = "mock";

export const DEV_MODEL_PORTS = {
  "mock-pi": 50221,
  "mock-jetson": 50222,
  "mock-lte": 50223,
  "mock-rut950": 50224,
} as const;

export type DevModelKey = keyof typeof DEV_MODEL_PORTS;

export const DEV_MODEL_ORDER: DevModelKey[] = [
  "mock-pi",
  "mock-jetson",
  "mock-lte",
  "mock-rut950",
];

export const DEFAULT_POCKETBASE_URL = "http://127.0.0.1:8090";

export const RUT_MOCK_PORT = 9100;

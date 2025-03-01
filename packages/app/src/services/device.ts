// src/services/device.ts
// This file centralizes all device communication. Replace the fetch stubs or add websockets as needed.

export interface DeviceCommandOptions {
  command: string;
  payload?: unknown;
}

export interface DeviceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeviceStatus {
  isConnected: boolean;
  currentMode: string;
  // Add other status fields as needed
}

export function sendDeviceCommand({
  command,
  payload,
}: DeviceCommandOptions): Promise<DeviceResponse> {
  // Early return for invalid commands
  if (!command) {
    return Promise.resolve({
      success: false,
      error: "Invalid command",
    });
  }

  // TODO: Replace with actual embedded device logic (e.g., serial, websockets, next-safe-action).
  // Example stub using fetch:
  return fetch("/api/device/send-command", {
    method: "POST",
    body: JSON.stringify({ command, payload }),
  })
    .then(async (res) => {
      if (!res.ok) {
        return { success: false, error: "Failed to send command" };
      }
      return { success: true, data: await res.json() };
    })
    .catch(() => {
      return { success: false, error: "Network error" };
    });
}

export function fetchDeviceStatus(): Promise<DeviceResponse<DeviceStatus>> {
  // Example stub that might poll status from an embedded device
  return fetch("/api/device/status")
    .then(async (res) => {
      if (!res.ok) {
        return { success: false, error: "Failed to fetch status" };
      }
      return { success: true, data: await res.json() };
    })
    .catch(() => {
      return { success: false, error: "Network error" };
    });
}

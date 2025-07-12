export type OfflineActionPayload = {
  deviceId: string;
  action: string;
  params?: Record<string, unknown>;
  ttl?: number; // in seconds, undefined means infinite
};

export type Events = {
  "device/offline.action": { data: OfflineActionPayload };
};

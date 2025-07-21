/**
 * Type definitions for the Whisper SMS Server
 */

export interface FetchClient {
  get: (url: string, headers?: Record<string, string>) => Promise<any>;
  post: (
    url: string,
    body: any,
    headers?: Record<string, string>
  ) => Promise<any>;
  delete: (url: string, headers?: Record<string, string>) => Promise<any>;
}

export interface SmsResponse {
  id: string;
  status: string;
  message?: string;
  timestamp: number;
}

export interface WebHookPayload {
  message?: string;
  phoneNumber?: string;
  receivedAt?: string;
}

export type AndroidSmsGatewayEvent = {
  event: string;
  id: string;
  status: string;
  payload?: WebHookPayload;
};

export type WebhookEvent = AndroidSmsGatewayEvent | WebHookPayload;

export interface PendingSmsMessage {
  resolve: (value: SmsResponse) => void;
  reject: (reason: any) => void;
  timeout: Timer;
  responses: SmsResponse[];
  finalResolve: (value: SmsResponse[]) => void;
}

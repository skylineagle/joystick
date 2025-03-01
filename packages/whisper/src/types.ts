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

export interface SmsMessage {
  phoneNumbers: string[];
  message: string;
}

export interface SmsResponse {
  id: string;
  status: string;
  message?: string;
  timestamp: number;
}

export interface WebhookEvent {
  event: string;
  id: string;
  status: string;

  payload?: {
    message?: string;
    phoneNumber?: string;
    receivedAt?: string;
  };
}

export interface PendingSmsMessage {
  resolve: (value: SmsResponse) => void;
  reject: (reason: any) => void;
  timeout: Timer;
  responses: SmsResponse[];
  finalResolve: (value: SmsResponse[]) => void;
}

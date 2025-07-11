import { Inngest } from "inngest";
import { createUrl, joystickApi } from "./api-client";
import { urls } from "@/lib/urls";

const INNGEST_BASE_URL =
  import.meta.env.VITE_INNGEST_URL ||
  (import.meta.env.PROD ? "/inngest" : "http://localhost:8288");
const INNGEST_EVENT_KEY = import.meta.env.VITE_INNGEST_EVENT_KEY || "dev";

export const inngest = new Inngest({
  id: "joystick-app",
  eventKey: INNGEST_EVENT_KEY,
  baseUrl: INNGEST_BASE_URL,
});

export type InngestEvent = {
  internal_id: string;
  accountID: string;
  environmentID: string;
  source: string;
  sourceID: string;
  receivedAt: string;
  id: string;
  name: string;
  data: Record<string, unknown>;
  user?: Record<string, unknown>;
  ts: number;
  v?: string;
};

export type InngestRun = {
  run_id: string;
  run_started_at: string;
  ended_at?: string | null;
  status: "Running" | "Completed" | "Failed" | "Cancelled";
  output?: Record<string, unknown> | string;
  function_id: string;
  function_version: number;
  environment_id: string;
  event_id?: string | null;
  batch_id?: string | null;
  original_run_id?: string | null;
  cron?: string | null;
};

export type InngestApiResponse<T> = {
  data: T;
  metadata: {
    fetchedAt: string;
    cachedUntil?: string | null;
  };
};

export type InngestEventsResponse = InngestApiResponse<InngestEvent[]>;
export type InngestEventResponse = InngestApiResponse<InngestEvent>;
export type InngestRunsResponse = InngestApiResponse<InngestRun[]>;
export type InngestRunResponse = InngestApiResponse<InngestRun>;

export async function fetchInngestEvents(
  options: {
    limit?: number;
    cursor?: string;
    name?: string;
    received_before?: string;
    received_after?: string;
  } = {}
): Promise<InngestEventsResponse> {
  const params = new URLSearchParams();
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.cursor) params.append("cursor", options.cursor);
  if (options.name) params.append("name", options.name);
  if (options.received_before)
    params.append("received_before", options.received_before);
  if (options.received_after)
    params.append("received_after", options.received_after);

  const url = createUrl(urls.inngest, `/v1/events?${params.toString()}`);
  return joystickApi.get<InngestEventsResponse>(url);
}

export async function fetchInngestEvent(
  eventId: string
): Promise<InngestEventResponse> {
  const url = createUrl(urls.inngest, `/v1/events/${eventId}`);
  return joystickApi.get<InngestEventResponse>(url);
}

export async function fetchInngestRun(
  runId: string
): Promise<InngestRunResponse> {
  const url = createUrl(urls.joystick, `/api/inngest/runs/${runId}`);
  return joystickApi.get<InngestRunResponse>(url);
}

export async function fetchInngestEventRuns(
  eventId: string
): Promise<InngestRunsResponse> {
  const url = createUrl(urls.inngest, `/v1/events/${eventId}/runs`);
  return joystickApi.get<InngestRunsResponse>(url);
}

export function convertInngestStatusToTaskStatus(
  status: InngestRun["status"]
): "queued" | "running" | "completed" | "failed" | "cancelled" {
  switch (status) {
    case "Running":
      return "running";
    case "Completed":
      return "completed";
    case "Failed":
      return "failed";
    case "Cancelled":
      return "cancelled";
    default:
      return "queued";
  }
}

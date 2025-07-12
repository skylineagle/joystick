import { urls } from "@/lib/urls";
import { ParamPath } from "@/types/params";
import { ApiError, createUrl, joystickApi } from "./api-client";
import { pb } from "@/lib/pocketbase";
import { getParamPath } from "@/lib/utils";

type JoystickApiResponse<T = unknown> = {
  success: boolean;
  output?: T;
  error?: string;
};

export type WriteParamsRequest = {
  deviceId: string;
  path: ParamPath;
  value: unknown;
};

export type ReadParamsRequest = {
  deviceId: string;
  path: ParamPath;
};

export type RunActionRequest = {
  deviceId: string;
  action: string;
  params?: Record<string, unknown>;
  timeout?: number;
  log?: boolean;
};

export type RunOfflineActionRequest = {
  deviceId: string;
  action: string;
  params?: Record<string, unknown>;
  ttl?: number;
};

export async function writeParams({
  deviceId,
  path,
  value,
}: WriteParamsRequest): Promise<JoystickApiResponse> {
  try {
    const url = createUrl(urls.joystick, `/api/run/${deviceId}/write`);
    const data = await joystickApi.post(url, {
      path: getParamPath(path),
      value,
    });

    return { success: true, output: data };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Failed to write parameter";

    console.error("Write params error:", error);

    // Don't show toast here since the API client already shows toasts
    return { success: false, error: message };
  }
}

export async function readParams<T>({
  deviceId,
  path,
}: ReadParamsRequest): Promise<JoystickApiResponse<T>> {
  try {
    const url = createUrl(urls.joystick, `/api/run/${deviceId}/read`);
    const data = await joystickApi.post(url, {
      path: getParamPath(path),
    });
    console.log(data);

    return data as JoystickApiResponse<T>;
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Failed to read parameter";

    console.error("Read params error:", error);

    // Don't show toast here since the API client already shows toasts
    return { success: false, error: message };
  }
}

export async function runAction({
  deviceId,
  action,
  params,
  timeout,
  log = true,
}: RunActionRequest): Promise<string | undefined> {
  try {
    const url = createUrl(
      urls.joystick,
      `/api/run/${deviceId}/${action}?log=${log.toString()}`
    );
    const data = await joystickApi.post<{
      success: boolean;
      output?: string;
      error?: string;
    }>(
      url,
      params ?? {},
      {
        headers: {
          "x-user-name": pb.authStore.record?.name ?? "unknown",
          "x-user-id": pb.authStore.record?.id ?? "unknown",
        },
      },
      timeout
    );

    if (!data.success) {
      throw new ApiError(data.error || "Failed to run action");
    }

    return data.output?.replace(/\n$/, "");
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Failed to run action";

    // Allow the caller to handle specific errors
    throw new ApiError(message, {
      status: error instanceof ApiError ? error.status : 0,
      isNetworkError: error instanceof ApiError ? error.isNetworkError : false,
      isTimeout: error instanceof ApiError ? error.isTimeout : false,
    });
  }
}

export async function runOfflineAction({
  deviceId,
  action,
  params,
  ttl,
}: RunOfflineActionRequest): Promise<{
  success: boolean;
  message: string;
  ids: string[];
}> {
  try {
    const url = createUrl(
      urls.joystick,
      `/api/run/${deviceId}/offline/${action}`
    );
    const data = await joystickApi.post<{
      success: boolean;
      message?: string;
      error?: string;
      ids: string[];
    }>(url, {
      params,
      ttl,
    });

    if (!data.success) {
      throw new ApiError(data.error || "Failed to queue offline action");
    }

    return {
      success: true,
      message: data.message || "Action queued for execution",
      ids: data.ids,
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Failed to queue offline action";

    throw new ApiError(message, {
      status: error instanceof ApiError ? error.status : 0,
      isNetworkError: error instanceof ApiError ? error.isNetworkError : false,
      isTimeout: error instanceof ApiError ? error.isTimeout : false,
    });
  }
}

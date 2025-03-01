import { urls } from "@/lib/urls";
import { ParamPath } from "@/types/params";
import { toast } from "@/utils/toast";

type JoystickApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
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
};

export async function writeParams({
  deviceId,
  path,
  value,
}: WriteParamsRequest): Promise<JoystickApiResponse> {
  try {
    const response = await fetch(`${urls.joystick}/api/run/${deviceId}/write`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: path.join("."),
        value,
      }),
    });

    if (!response.ok) throw new Error("Failed to write parameter");

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to write parameter";
    toast.error({
      message,
    });
    console.log(error);

    return { success: false, error: message };
  }
}

export async function readParams({
  deviceId,
  path,
}: ReadParamsRequest): Promise<JoystickApiResponse> {
  try {
    const response = await fetch(`${urls.joystick}/api/run/${deviceId}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: path.join("."),
      }),
    });

    if (!response.ok) throw new Error("Failed to read parameter");

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read parameter";
    toast.error({
      message,
    });

    return { success: false, error: message };
  }
}

export async function runAction({
  deviceId,
  action,
  params,
}: RunActionRequest) {
  try {
    const response = await fetch(
      `${urls.joystick}/api/run/${deviceId}/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params ?? {}),
      }
    );

    if (!response.ok) throw new Error("Failed to run action");

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return data.output?.replace(/\n$/, "");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run action";
    toast.error({
      message,
    });

    throw new Error(message);
  }
}

import { toast } from "sonner";
import { ParamPath } from "@/types/params";

interface JoystickApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WriteParamsRequest {
  deviceId: string;
  path: ParamPath;
  value: unknown;
}

export interface ReadParamsRequest {
  deviceId: string;
  path: ParamPath;
}

export async function writeParams({
  deviceId,
  path,
  value,
}: WriteParamsRequest): Promise<JoystickApiResponse> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_JOYSTICK_URL}/api/run/${deviceId}/write`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: path.join("."),
          value,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to write parameter");

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to write parameter";
    toast.error(message);
    return { success: false, error: message };
  }
}

export async function readParams({
  deviceId,
  path,
}: ReadParamsRequest): Promise<JoystickApiResponse> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_JOYSTICK_URL}/api/run/${deviceId}/read`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: path.join("."),
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to read parameter");

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read parameter";
    toast.error(message);
    return { success: false, error: message };
  }
}

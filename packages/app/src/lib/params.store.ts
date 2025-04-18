import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DeviceValue, ParamPath, ParamValue } from "@/types/params";
import { readParams, writeParams } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { parseParamValue } from "@/lib/utils";

interface ParamsState {
  values: Record<string, DeviceValue>;
  deviceId: string | null;
  schema: Record<string, ParamValue>;
  setDeviceId: (deviceId: string) => void;
  setEditedValue: (path: ParamPath, value: unknown) => void;
  commitValue: (path: ParamPath) => Promise<void>;
  readValue: (path: ParamPath, expectedType?: string) => Promise<void>;
  readAllValues: () => Promise<void>;
}

export const useParamsStore = create<ParamsState>()(
  devtools((set, get) => ({
    values: {},
    deviceId: null,

    setDeviceId: (deviceId: string) => {
      set({ deviceId });
    },

    setEditedValue: (path: ParamPath, value: unknown) => {
      const pathStr = path.join(".");
      const currentValue = get().values[pathStr];

      // Only mark as edited if the value is different from current
      const shouldSetEdited = currentValue?.current !== value;

      set((state) => ({
        values: {
          ...state.values,
          [pathStr]: {
            ...currentValue,
            edited: shouldSetEdited ? value : null,
            error: undefined,
          },
        },
      }));
    },

    commitValue: async (path: ParamPath) => {
      const pathStr = path.join(".");
      const value = get().values[pathStr];
      const deviceId = get().deviceId;

      // Only commit if there's an edited value that's different from current
      if (!value || value.edited === null || !deviceId) return;

      set((state) => ({
        values: {
          ...state.values,
          [pathStr]: {
            ...value,
            pending: value.edited,
            isLoading: true,
            error: undefined,
          },
        },
      }));

      try {
        const response = await writeParams({
          deviceId,
          path,
          value: value.edited,
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to write value");
        }

        set((state) => ({
          values: {
            ...state.values,
            [pathStr]: {
              ...value,
              current: value.edited,
              pending: null,
              edited: null,
              isLoading: false,
              error: undefined,
            },
          },
        }));
      } catch (error) {
        set((state) => ({
          values: {
            ...state.values,
            [pathStr]: {
              ...value,
              pending: null,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to write value",
            },
          },
        }));
      }
    },

    readValue: async (path: ParamPath, expectedType?: string) => {
      const pathStr = path.join(".");
      const value = get().values[pathStr];
      const deviceId = get().deviceId;

      if (!deviceId) return;

      set((state) => ({
        values: {
          ...state.values,
          [pathStr]: {
            ...value,
            isLoading: true,
            error: undefined,
          },
        },
      }));

      try {
        const response = await readParams<string>({
          deviceId,
          path,
        });

        if (!response.success) {
          toast.error({ message: response.error || "Failed to read value" });
          throw new Error(response.error || "Failed to read value");
        }

        if (!response.output) {
          toast.error({ message: "Failed to read value" });
        }

        const parsedOutput = expectedType
          ? parseParamValue(response.output!, expectedType)
          : response.output;

        set((state) => ({
          values: {
            ...state.values,
            [pathStr]: {
              current: parsedOutput,
              pending: null,
              edited: null,
              isLoading: false,
              error: undefined,
            },
          },
        }));
      } catch (error) {
        toast.error({ message: "Failed to parse value" });
        set((state) => ({
          values: {
            ...state.values,
            [pathStr]: {
              current: null,
              pending: null,
              edited: null,
              isLoading: false,
              error:
                error instanceof Error ? error.message : "Failed to read value",
            },
          },
        }));
      }
    },

    readAllValues: async () => {
      const deviceId = get().deviceId;
      if (!deviceId) return;

      const paths = Object.keys(get().values).map((path) => path.split("."));
      await Promise.all(paths.map((path) => get().readValue(path)));
    },
  }))
);

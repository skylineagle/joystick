import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DeviceValue, ParamPath, ParamValue } from "@/types/params";
import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { parseParamValue } from "@/lib/utils";

interface ParamsState {
  values: Record<string, Record<string, DeviceValue>>;
  deviceId: string | null;
  schema: Record<string, ParamValue>;
  actions: Record<string, { readAction: string; writeAction: string }>;
  setDeviceId: (deviceId: string) => void;
  setTreeActions: (
    treeId: string,
    readAction: string,
    writeAction: string
  ) => void;
  setEditedValue: (treeId: string, path: ParamPath, value: unknown) => void;
  commitValue: (treeId: string, path: ParamPath) => Promise<void>;
  readValue: (
    treeId: string,
    path: ParamPath,
    expectedType?: string
  ) => Promise<void>;
  readAllValues: (treeId: string) => Promise<void>;
}

export const useParamsStore = create<ParamsState>()(
  devtools((set, get) => ({
    values: {},
    deviceId: null,
    schema: {},
    actions: {},

    setDeviceId: (deviceId: string) => {
      set({ deviceId });
    },

    setTreeActions: (
      treeId: string,
      readAction: string,
      writeAction: string
    ) => {
      set((state) => ({
        actions: {
          ...state.actions,
          [treeId]: { readAction, writeAction },
        },
      }));
    },

    setEditedValue: (treeId: string, path: ParamPath, value: unknown) => {
      const pathStr = path.join(".");
      const treeValues = get().values[treeId] || {};
      const currentValue = treeValues[pathStr];
      const shouldSetEdited = currentValue?.current !== value;
      set((state) => ({
        values: {
          ...state.values,
          [treeId]: {
            ...treeValues,
            [pathStr]: {
              ...currentValue,
              edited: shouldSetEdited ? value : null,
              error: undefined,
            },
          },
        },
      }));
    },

    commitValue: async (treeId: string, path: ParamPath) => {
      const pathStr = path.join(".");
      const treeValues = get().values[treeId] || {};
      const value = treeValues[pathStr];
      const deviceId = get().deviceId;
      const action = get().actions[treeId]?.writeAction;
      if (!value || value.edited === null || !deviceId || !action) return;
      set((state) => ({
        values: {
          ...state.values,
          [treeId]: {
            ...treeValues,
            [pathStr]: {
              ...value,
              pending: value.edited,
              isLoading: true,
              error: undefined,
            },
          },
        },
      }));
      try {
        const response = await runAction({
          deviceId,
          action,
          params: {
            path,
            value: value.edited,
          },
        });
        if (!response) {
          throw new Error("Failed to write value");
        }
        set((state) => ({
          values: {
            ...state.values,
            [treeId]: {
              ...treeValues,
              [pathStr]: {
                ...value,
                current: value.edited,
                pending: null,
                edited: null,
                isLoading: false,
                error: undefined,
              },
            },
          },
        }));
      } catch (error) {
        set((state) => ({
          values: {
            ...state.values,
            [treeId]: {
              ...treeValues,
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
          },
        }));
      }
    },

    readValue: async (
      treeId: string,
      path: ParamPath,
      expectedType?: string
    ) => {
      const pathStr = path.join(".");
      const treeValues = get().values[treeId] || {};
      const value = treeValues[pathStr];
      const deviceId = get().deviceId;
      const action = get().actions[treeId]?.readAction;
      if (!deviceId || !action) return;
      set((state) => ({
        values: {
          ...state.values,
          [treeId]: {
            ...treeValues,
            [pathStr]: {
              ...value,
              isLoading: true,
              error: undefined,
            },
          },
        },
      }));
      try {
        const output = await runAction({
          deviceId,
          action,
          params: {
            path,
          },
        });
        if (!output) {
          toast.error({ message: "Failed to read value" });
          throw new Error("Failed to read value");
        }
        const parsedOutput = expectedType
          ? parseParamValue(output, expectedType)
          : output;
        set((state) => ({
          values: {
            ...state.values,
            [treeId]: {
              ...treeValues,
              [pathStr]: {
                current: parsedOutput,
                pending: null,
                edited: null,
                isLoading: false,
                error: undefined,
              },
            },
          },
        }));
      } catch (error) {
        toast.error({ message: "Failed to parse value" });
        set((state) => ({
          values: {
            ...state.values,
            [treeId]: {
              ...treeValues,
              [pathStr]: {
                current: null,
                pending: null,
                edited: null,
                isLoading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to read value",
              },
            },
          },
        }));
      }
    },

    readAllValues: async (treeId: string) => {
      const deviceId = get().deviceId;
      if (!deviceId) return;
      const treeValues = get().values[treeId] || {};
      const paths = Object.keys(treeValues).map((path) => Array.from(path.split(".")));
      await Promise.all(paths.map((path) => get().readValue(treeId, path)));
    },
  }))
);

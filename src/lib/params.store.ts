import { create } from "zustand";
import { DeviceValue, ParamPath } from "@/types/params";

interface ParamsState {
  values: Record<string, DeviceValue>;
  setEditedValue: (path: ParamPath, value: unknown) => void;
  commitValue: (path: ParamPath) => Promise<void>;
  readValue: (path: ParamPath) => Promise<void>;
  readAllValues: () => Promise<void>;
}

export const useParamsStore = create<ParamsState>((set, get) => ({
  values: {},

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

    // Only commit if there's an edited value that's different from current
    if (!value || value.edited === null) return;

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
      // Mock device communication - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
              error instanceof Error ? error.message : "Failed to write value",
          },
        },
      }));
    }
  },

  readValue: async (path: ParamPath) => {
    const pathStr = path.join(".");
    const value = get().values[pathStr];

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
      // Mock device communication - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newValue = Math.random() > 0.5; // For testing boolean values

      set((state) => ({
        values: {
          ...state.values,
          [pathStr]: {
            current: newValue,
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
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to read value",
          },
        },
      }));
    }
  },

  readAllValues: async () => {
    // Mock implementation - replace with actual device communication
    const paths = Object.keys(get().values).map((path) => path.split("."));
    await Promise.all(paths.map((path) => get().readValue(path)));
  },
}));

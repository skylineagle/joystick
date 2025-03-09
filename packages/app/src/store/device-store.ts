import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SortState, SortableColumn } from "@/types/table";
import { DeviceResponse } from "@/types/types";

interface DeviceStore {
  searchQuery: string;
  selectedModes: string[];
  sortState: SortState;
  selectedDevices: string[];
  isReversed: boolean;
  devices: DeviceResponse[];
}

interface DeviceActions {
  updateDevice: (device: DeviceResponse) => void;
  deleteDevice: (id: string) => void;
  addDevice: (device: DeviceResponse) => void;
  setDevices: (devices: DeviceResponse[]) => void;
  setSearchQuery: (query: string) => void;
  toggleMode: (mode: string) => void;
  setSortState: (column: SortableColumn) => void;
  selectDevice: (id: string, checked: boolean) => void;
  selectAllDevices: (ids: string[]) => void;
  clearSelection: () => void;
  clearFilters: () => void;
  clearMode: (mode: string) => void;
  toggleReversed: () => void;
}

const initialState: DeviceStore = {
  devices: [],
  searchQuery: "",
  selectedModes: [],
  sortState: {
    column: "name",
    direction: null,
  },
  selectedDevices: [],
  isReversed: false,
};

export const useDeviceStore = create<DeviceStore & DeviceActions>()(
  persist(
    (set) => ({
      ...initialState,
      setDevices: (devices) => set({ devices }),

      deleteDevice: (id) =>
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
        })),
      addDevice: (device) =>
        set((state) => ({ devices: [...state.devices, device] })),
      updateDevice: (device) =>
        set((state) => ({
          devices: state.devices.map((d) => (d.id === device.id ? device : d)),
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleMode: (mode) =>
        set((state) => ({
          selectedModes: state.selectedModes.includes(mode)
            ? state.selectedModes.filter((m) => m !== mode)
            : [...state.selectedModes, mode],
        })),
      setSortState: (column) =>
        set((state) => ({
          sortState: {
            column,
            direction:
              state.sortState.column === column
                ? state.sortState.direction === null
                  ? "asc"
                  : state.sortState.direction === "asc"
                  ? "desc"
                  : null
                : "asc",
          },
        })),
      selectDevice: (id, checked) =>
        set((state) => ({
          selectedDevices: checked
            ? [...state.selectedDevices, id]
            : state.selectedDevices.filter((deviceId) => deviceId !== id),
        })),
      selectAllDevices: (ids) =>
        set((state) => ({
          selectedDevices:
            state.selectedDevices.length === ids.length ? [] : ids,
        })),
      clearSelection: () => set({ selectedDevices: [] }),
      clearFilters: () =>
        set({
          searchQuery: "",
          selectedModes: [],
          sortState: initialState.sortState,
          isReversed: false,
        }),
      clearMode: (mode) =>
        set((state) => ({
          selectedModes: state.selectedModes.filter((m) => m !== mode),
        })),
      toggleReversed: () => set((state) => ({ isReversed: !state.isReversed })),
    }),
    {
      name: "device-store",
    }
  )
);

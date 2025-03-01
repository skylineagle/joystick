import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SortState, SortableColumn } from "@/types/table";

interface DeviceFilters {
  searchQuery: string;
  selectedModes: string[];
  sortState: SortState;
  selectedDevices: string[];
  isReversed: boolean;
}

interface DeviceActions {
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

const initialState: DeviceFilters = {
  searchQuery: "",
  selectedModes: [],
  sortState: {
    column: "name",
    direction: null,
  },
  selectedDevices: [],
  isReversed: false,
};

export const useDeviceStore = create<DeviceFilters & DeviceActions>()(
  persist(
    (set) => ({
      ...initialState,
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

import { create } from "zustand";
import { CommittedRoiProperties } from "react-roi";

interface RoiState {
  rois: CommittedRoiProperties<unknown>[];
  addRoi: (roi: CommittedRoiProperties<unknown>) => void;
  updateRoi: (
    id: string,
    roi: Partial<CommittedRoiProperties<unknown>>
  ) => void;
  clearRois: () => void;
}

export const useRoiStore = create<RoiState>((set) => ({
  rois: [],
  addRoi: (roi) => set((state) => ({ rois: [...state.rois, roi] })),
  updateRoi: (id, roi) =>
    set((state) => ({
      rois: state.rois.map((r) => (r.id === id ? { ...r, ...roi } : r)),
    })),
  clearRois: () => set({ rois: [] }),
}));

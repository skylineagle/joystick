import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BorderStyle = "solid" | "dashed" | "dotted" | "double";

export interface RoiStyle {
  borderColor: string;
  borderStyle: BorderStyle;
  borderWidth: number;
  fillColor: string;
  fillOpacity: number;
}

export interface SelectedRoiStyle extends RoiStyle {
  highlightColor: string;
}

interface RoiStyleState {
  defaultStyle: RoiStyle;
  selectedStyle: SelectedRoiStyle;
  deviceStyles: Record<
    string,
    {
      defaultStyle: RoiStyle;
      selectedStyle: SelectedRoiStyle;
      roiStyles: Record<string, RoiStyle>;
    }
  >;
  setDefaultStyle: (deviceId: string, style: Partial<RoiStyle>) => void;
  setSelectedStyle: (
    deviceId: string,
    style: Partial<SelectedRoiStyle>
  ) => void;
  setRoiStyle: (
    deviceId: string,
    roiId: string,
    style: Partial<RoiStyle>
  ) => void;
  getStylesForDevice: (deviceId: string) => {
    defaultStyle: RoiStyle;
    selectedStyle: SelectedRoiStyle;
    roiStyles: Record<string, RoiStyle>;
  };
  getRoiStyle: (
    deviceId: string,
    roiId: string,
    isSelected: boolean
  ) => RoiStyle;
  resetRoiStyle: (deviceId: string, roiId: string) => void;
}

const DEFAULT_ROI_STYLE: RoiStyle = {
  borderColor: "hsl(var(--foreground))",
  borderStyle: "solid",
  borderWidth: 2,
  fillColor: "hsl(var(--background))",
  fillOpacity: 0.2,
};

const DEFAULT_SELECTED_ROI_STYLE: SelectedRoiStyle = {
  ...DEFAULT_ROI_STYLE,
  borderColor: "hsl(var(--primary))",
  borderWidth: 3,
  highlightColor: "hsl(var(--accent) / 0.5)",
};

export const useRoiStyleStore = create<RoiStyleState>()(
  persist(
    (set, get) => ({
      defaultStyle: DEFAULT_ROI_STYLE,
      selectedStyle: DEFAULT_SELECTED_ROI_STYLE,
      deviceStyles: {},

      setDefaultStyle: (deviceId: string, style: Partial<RoiStyle>) => {
        set((state) => {
          const currentDeviceStyles = state.deviceStyles[deviceId] || {
            defaultStyle: DEFAULT_ROI_STYLE,
            selectedStyle: DEFAULT_SELECTED_ROI_STYLE,
            roiStyles: {},
          };

          return {
            deviceStyles: {
              ...state.deviceStyles,
              [deviceId]: {
                ...currentDeviceStyles,
                defaultStyle: {
                  ...currentDeviceStyles.defaultStyle,
                  ...style,
                },
              },
            },
          };
        });
      },

      setSelectedStyle: (
        deviceId: string,
        style: Partial<SelectedRoiStyle>
      ) => {
        set((state) => {
          const currentDeviceStyles = state.deviceStyles[deviceId] || {
            defaultStyle: DEFAULT_ROI_STYLE,
            selectedStyle: DEFAULT_SELECTED_ROI_STYLE,
            roiStyles: {},
          };

          return {
            deviceStyles: {
              ...state.deviceStyles,
              [deviceId]: {
                ...currentDeviceStyles,
                selectedStyle: {
                  ...currentDeviceStyles.selectedStyle,
                  ...style,
                },
              },
            },
          };
        });
      },

      setRoiStyle: (
        deviceId: string,
        roiId: string,
        style: Partial<RoiStyle>
      ) => {
        set((state) => {
          const currentDeviceStyles = state.deviceStyles[deviceId] || {
            defaultStyle: DEFAULT_ROI_STYLE,
            selectedStyle: DEFAULT_SELECTED_ROI_STYLE,
            roiStyles: {},
          };

          const currentRoiStyle = currentDeviceStyles.roiStyles?.[roiId] || {
            ...currentDeviceStyles.defaultStyle,
          };

          return {
            deviceStyles: {
              ...state.deviceStyles,
              [deviceId]: {
                ...currentDeviceStyles,
                roiStyles: {
                  ...currentDeviceStyles.roiStyles,
                  [roiId]: {
                    ...currentRoiStyle,
                    ...style,
                  },
                },
              },
            },
          };
        });
      },

      resetRoiStyle: (deviceId: string, roiId: string) => {
        set((state) => {
          const currentDeviceStyles = state.deviceStyles[deviceId];
          if (!currentDeviceStyles) return state;

          const newRoiStyles = { ...currentDeviceStyles.roiStyles };
          delete newRoiStyles[roiId];

          return {
            deviceStyles: {
              ...state.deviceStyles,
              [deviceId]: {
                ...currentDeviceStyles,
                roiStyles: newRoiStyles,
              },
            },
          };
        });
      },

      getStylesForDevice: (deviceId: string) => {
        const state = get();
        return (
          state.deviceStyles?.[deviceId] || {
            defaultStyle: state.defaultStyle,
            selectedStyle: state.selectedStyle,
            roiStyles: {},
          }
        );
      },

      getRoiStyle: (deviceId: string, roiId: string, isSelected: boolean) => {
        const { defaultStyle, selectedStyle, roiStyles } =
          get().getStylesForDevice(deviceId);

        // If ROI has custom style, use it
        if (roiStyles?.[roiId]) {
          return roiStyles[roiId];
        }

        // Otherwise use default or selected style based on selection state
        return isSelected ? selectedStyle : defaultStyle;
      },
    }),
    {
      name: "roi-styles",
      partialize: (state) => ({
        deviceStyles: state.deviceStyles,
      }),
    }
  )
);

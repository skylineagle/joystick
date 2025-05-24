import { ModelModeConfigs } from "@/types/types";

export const modeConfig: ModelModeConfigs = {
  live: {
    label: "Live Stream",
    icon: "video",
    description: "Camera is actively streaming",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    hoverColor: "hover:bg-chart-2/10 focus:bg-chart-2/10",
  },
  off: {
    label: "Offline",
    icon: "ban",
    description: "Camera is turned off",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10",
    hoverColor: "hover:bg-muted/10 focus:bg-muted/10",
  },
  "live-day": {
    label: "Live Day",
    icon: "sun",
    description: "Using the day preset",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    hoverColor: "hover:bg-chart-4/10 focus:bg-chart-4/10",
  },
  "live-night": {
    label: "Live Night",
    icon: "moon",
    description: "Using the night preset",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    hoverColor: "hover:bg-chart-5/10 focus:bg-chart-5/10",
  },
  // test: {
  //   label: "Testing",
  //   icon: "flame",
  //   description: "Testing",
  //   color: "text-orange-500",
  //   bgColor: "bg-orange-500/10",
  //   hoverColor: "hover:bg-orange-500/10 focus:bg-orange-500/10",
  // },
  auto: {
    label: "Automated",
    icon: "clock",
    description: "Camera follows automated schedule",
    color: "text-primary",
    bgColor: "bg-primary/10",
    hoverColor: "hover:bg-primary/10 focus:bg-primary/10",
  },
};

export const getDefaultModeConfig = (mode: string) => {
  return {
    label: mode,
    icon: "CornerDownRight",
    description: `Camera is in ${mode} mode`,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    hoverColor: "hover:bg-chart-3/10",
  };
};

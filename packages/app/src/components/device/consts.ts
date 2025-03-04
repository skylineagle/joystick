import { ModelModeConfigs } from "@/types/types";

export const modeConfig: ModelModeConfigs = {
  live: {
    label: "Live Stream",
    icon: "video",
    description: "Camera is actively streaming",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "hover:bg-green-500/10 focus:bg-green-500/10",
  },
  off: {
    label: "Offline",
    icon: "ban",
    description: "Camera is turned off",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    hoverColor: "hover:bg-slate-500/10 focus:bg-slate-500/10",
  },
  "live-day": {
    label: "Live Day",
    icon: "sun",
    description: "Using the day preset",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    hoverColor: "hover:bg-yellow-500/10 focus:bg-yellow-500/10",
  },
  "live-night": {
    label: "Live Night",
    icon: "moon",
    description: "Using the night preset",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    hoverColor: "hover:bg-indigo-500/10 focus:bg-indigo-500/10",
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
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "hover:bg-blue-500/10 focus:bg-blue-500/10",
  },
};

export const getDefaultModeConfig = (mode: string) => {
  return {
    label: mode,
    icon: "CornerDownRight",
    description: `Camera is in ${mode} mode`,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "hover:bg-purple-500/10",
  };
};

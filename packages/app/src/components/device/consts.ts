import { Ban, Clock, CornerDownRight, Video } from "lucide-react";

export const modeConfig = {
  live: {
    label: "Live Stream",
    icon: Video,
    description: "Camera is actively streaming",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "hover:bg-green-500/10",
  },
  off: {
    label: "Offline",
    icon: Ban,
    description: "Camera is turned off",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    hoverColor: "hover:bg-slate-500/10",
  },
  auto: {
    label: "Automated",
    icon: Clock,
    description: "Camera follows automated schedule",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "hover:bg-blue-500/10",
  },
} as const;

export const getDefaultModeConfig = (mode: string) => {
  return {
    label: mode,
    icon: CornerDownRight,
    description: `Camera is in ${mode} mode`,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "hover:bg-purple-500/10",
  };
};

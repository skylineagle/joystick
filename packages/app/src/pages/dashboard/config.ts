import {
  Ban,
  Clock,
  Filter,
  Loader2,
  PauseCircle,
  PlayCircle,
  Video,
} from "lucide-react";

export const modeConfig = {
  live: {
    icon: Video,
    label: "Live",
    color: "text-green-500",
  },
  auto: {
    icon: Clock,
    label: "Auto",
    color: "text-blue-500",
  },
  offline: {
    icon: Ban,
    label: "Offline",
    color: "text-gray-500",
  },
  all: {
    icon: Filter,
    label: "All modes",
    color: "text-foreground",
  },
} as const;

export const statusConfig = {
  on: {
    icon: PlayCircle,
    label: "On",
    color: "text-green-500",
  },
  off: {
    icon: PauseCircle,
    label: "Off",
    color: "text-gray-500",
  },
  waiting: {
    icon: Loader2,
    label: "Waiting",
    color: "text-yellow-500",
  },
  all: {
    icon: Filter,
    label: "All statuses",
    color: "text-foreground",
  },
} as const;

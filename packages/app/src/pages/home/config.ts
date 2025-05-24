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
    color: "text-chart-2",
  },
  auto: {
    icon: Clock,
    label: "Auto",
    color: "text-chart-1",
  },
  offline: {
    icon: Ban,
    label: "Offline",
    color: "text-muted-foreground",
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
    color: "text-chart-2",
  },
  off: {
    icon: PauseCircle,
    label: "Off",
    color: "text-muted-foreground",
  },
  waiting: {
    icon: Loader2,
    label: "Waiting",
    color: "text-chart-4",
  },
  all: {
    icon: Filter,
    label: "All statuses",
    color: "text-foreground",
  },
} as const;

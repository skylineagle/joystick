import { AlertCircle, CheckCircle, Clock, Timer } from "lucide-react";
import { InngestRun } from "@/lib/inngest";
import { BadgeProps } from "@/components/ui/badge";

export const getStatusText = (status?: InngestRun["status"]) => {
  switch (status) {
    case "Running":
      return "Running";
    case "Completed":
      return "Completed";
    case "Failed":
      return "Failed";
    case "Cancelled":
      return "Cancelled";
    default:
      return "Unknown";
  }
};

export const getStatusColor = (
  status?: InngestRun["status"]
): BadgeProps["variant"] => {
  switch (status) {
    case "Running":
      return "default";
    case "Completed":
      return "connected";
    case "Failed":
      return "destructive";
    case "Cancelled":
      return "disconnected";
    default:
      return "default";
  }
};

export const getStatusIcon = (status?: InngestRun["status"]) => {
  switch (status) {
    case "Running":
      return <Clock className="h-4 w-4 animate-spin" />;
    case "Completed":
      return <CheckCircle className="h-4 w-4 animate-pulse" />;
    case "Failed":
      return <AlertCircle className="h-4 w-4" />;
    case "Cancelled":
      return <Timer className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export const getTaskProgress = (task?: InngestRun): number => {
  if (!task) {
    return 0;
  }

  switch (task.status) {
    case "Running":
      return 50;
    case "Completed":
      return 100;
    case "Failed":
      return 100;
    case "Cancelled":
      return 100;
    default:
      return 0;
  }
};

export const getTaskDuration = (task?: InngestRun): string => {
  if (!task) {
    return "Invalid duration";
  }

  if (task.ended_at) {
    try {
      const completedTime = new Date(task.ended_at).getTime();
      const createdTime = new Date(task.run_started_at).getTime();

      if (isNaN(completedTime) || isNaN(createdTime)) {
        return "Invalid duration";
      }

      const duration = completedTime - createdTime;
      const seconds = Math.floor(duration / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    } catch {
      return "Invalid duration";
    }
  }
  return "In progress";
};

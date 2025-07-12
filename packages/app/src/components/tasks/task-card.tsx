import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useTask } from "@/hooks/use-task";
import { InngestEvent } from "@/lib/inngest";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  RefreshCcw,
  Settings,
  Timer,
  Zap,
} from "lucide-react";
import { FC, useState } from "react";
import { Link } from "react-router";
import { TaskResult } from "./task-result";
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getTaskDuration,
  getTaskProgress,
} from "./utils";

const safeFormatDistanceToNow = (date: Date | string | number): string => {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.warn("Error formatting date:", date, error);
    return "Invalid date";
  }
};

interface TaskCardProps {
  task: InngestEvent;

  className?: string;
}

export const TaskCard: FC<TaskCardProps> = ({ task, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { task: runs, refetch, isLoading } = useTask(task.id);
  const taskRun = runs?.[0];
  const progress = getTaskProgress(taskRun);
  const duration = getTaskDuration(taskRun);

  const isActive = taskRun?.status === "Running";
  const isCompleted = taskRun?.status === "Completed";
  const isFailed =
    taskRun?.status === "Failed" || taskRun?.status === "Cancelled";

  return (
    <motion.div
      initial="hidden"
      animate={isCompleted ? "completed" : "visible"}
      exit="exit"
      layout
      className={cn("w-full", className)}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-md",
          {
            "ring-2 ring-primary/20 shadow-lg": isActive,
            "ring-2 ring-green-500/30 shadow-green-100/50 bg-green-50/30 dark:bg-green-950/20":
              isCompleted,
            "ring-2 ring-red-500/20 shadow-sm": isFailed,
          }
        )}
      >
        <div
          className={cn(
            "absolute top-0 left-0 h-1 transition-all duration-700 ease-out",
            {
              "bg-primary animate-pulse": isActive,
              "bg-gradient-to-r from-green-400 to-green-600": isCompleted,
              "bg-red-500": isFailed,
              "bg-muted": !isActive && !isCompleted && !isFailed,
            }
          )}
          style={{ width: `${progress}%` }}
        />

        {isCompleted && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-0 left-0 w-full h-1 bg-green-500/20 origin-left"
          />
        )}

        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge
                variant={getStatusColor(taskRun?.status)}
                className={cn("gap-1.5 transition-all duration-300", {
                  "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800":
                    isCompleted,
                  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800":
                    isActive,
                  "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800":
                    isFailed,
                })}
              >
                {getStatusIcon(taskRun?.status)}
                {getStatusText(taskRun?.status)}
              </Badge>

              <div className="flex flex-row items-center gap-2">
                <span className="font-semibold text-sm">{task.name}</span>
                <Link
                  to={`${urls.inngest}/run?runID=${taskRun?.run_id}`}
                  target="_blank"
                  className="text-xs text-link hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {taskRun?.cron && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  {taskRun.cron}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCcw
                  className={cn("h-3 w-3", { "animate-spin": isLoading })}
                />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {safeFormatDistanceToNow(taskRun?.run_started_at ?? "")}
              </div>

              {taskRun?.ended_at && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {duration}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {task.data && Object.keys(task.data).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 px-2 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Details
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent>
              <div className="space-y-3">
                {task.data && Object.keys(task.data).length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Parameters</h4>
                    <div className="bg-muted/50 rounded-md p-3 text-xs font-mono">
                      {JSON.stringify(task.data, null, 2)}
                    </div>
                  </div>
                )}

                {taskRun?.status === "Failed" && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2 text-red-600">
                      Error
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700">
                      {typeof taskRun.output === "string"
                        ? taskRun.output
                        : JSON.stringify(taskRun.output, null, 2)}
                    </div>
                  </div>
                )}

                {taskRun?.status === "Completed" && (
                  <div className="border-t border-green-200/50 pt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <h4 className="text-sm font-medium text-green-700 dark:text-green-400">
                        Task Completed Successfully
                      </h4>
                    </div>
                    {taskRun.output && (
                      <div className="mt-2">
                        <h5 className="text-xs font-medium text-green-600 dark:text-green-500 mb-2">
                          Result
                        </h5>
                        <TaskResult result={taskRun.output} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </motion.div>
  );
};

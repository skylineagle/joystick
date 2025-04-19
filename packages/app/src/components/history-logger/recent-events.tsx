import {
  getActionDisplayName,
  getUserDisplayName,
} from "@/components/history-logger/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchActionLogs } from "@/lib/analytics";
import { pb } from "@/lib/pocketbase";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Info,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export function RecentEvents() {
  const queryClient = useQueryClient();
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const { data: recentLogs } = useQuery({
    queryKey: ["actionLogs", "recent"],
    queryFn: () => fetchActionLogs(1, 5),
    refetchInterval: 5000,
    staleTime: 0,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    pb.collection("action_logs").subscribe("*", (event) => {
      if (event.action === "create") {
        queryClient.invalidateQueries({ queryKey: ["actionLogs", "recent"] });
      }
    });

    return () => {
      pb.collection("action_logs")?.unsubscribe("*");
    };
  }, [queryClient]);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  return (
    <Card className="m-1 shadow-2xl">
      <CardHeader className="p-3 m-0">
        <CardTitle className="text-muted-foreground">Recent Events</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea>
          <div className="flex flex-col gap-2 p-0">
            <AnimatePresence mode="popLayout">
              {recentLogs?.items.map((log, index) => {
                const isExpanded = expandedEventId === log.id;
                const isSuccess = log.result?.success;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      height: isExpanded ? "auto" : "auto",
                      transition: { duration: 0.2 },
                    }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.15, delay: index * 0.03 }}
                    className={cn(
                      "flex flex-col rounded-md text-xs transition-all",
                      "hover:bg-accent/50 cursor-pointer",
                      isExpanded ? "p-2 bg-accent" : "p-1.5",
                      isSuccess
                        ? "border-l-2 border-l-green-500"
                        : "border-l-2 border-l-red-500"
                    )}
                    onClick={() => toggleEventExpansion(log.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 flex-1">
                        <Avatar className="size-5">
                          <AvatarImage
                            src={`${urls.pocketbase}/api/files/${log.expand?.user?.collectionId}/${log.expand?.user?.id}/${log.expand?.user?.avatar}`}
                            alt={
                              log.expand?.user?.username ||
                              log.expand?.user?.email
                            }
                          />
                          <AvatarFallback className="size-5">
                            {getUserDisplayName(log.expand?.user)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="break-words font-medium">
                          {getActionDisplayName(
                            log.expand?.action?.name || log.action
                          )}
                        </span>
                        {log.parameters &&
                          Object.keys(log.parameters).length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="max-w-[200px]"
                              >
                                <div className="text-xs space-y-1">
                                  {Object.entries(log.parameters).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex justify-between gap-2"
                                      >
                                        <span className="text-muted">
                                          {key}:
                                        </span>
                                        <span className="font-medium">
                                          {String(value)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted/30 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="text-xs">
                              {new Date(log.created).toLocaleString([], {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted/30 text-muted-foreground">
                              <Smartphone className="h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="text-xs">
                              {log.expand?.device.name || "Unknown"}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded details on click */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-1"
                        >
                          <div className="border-t border-border pt-1.5">
                            {/* Status badge */}
                            <div className="flex items-center gap-1 mb-2">
                              <Badge
                                variant={isSuccess ? "default" : "destructive"}
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4",
                                  isSuccess
                                    ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                                    : ""
                                )}
                              >
                                {isSuccess ? (
                                  <div className="flex items-center gap-0.5">
                                    <CheckCircle className="h-2.5 w-2.5" />
                                    <span>Success</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-0.5">
                                    <XCircle className="h-2.5 w-2.5" />
                                    <span>Failed</span>
                                  </div>
                                )}
                              </Badge>
                            </div>

                            {/* Info cards */}
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="bg-muted/30 rounded-md p-1.5 flex items-center gap-1.5">
                                <div className="bg-primary/10 p-1 rounded-full">
                                  <Avatar className="size-5">
                                    <AvatarImage
                                      src={`${urls.pocketbase}/api/files/${log.expand?.user?.collectionId}/${log.expand?.user?.id}/${log.expand?.user?.avatar}`}
                                      alt={
                                        log.expand?.user?.username ||
                                        log.expand?.user?.email
                                      }
                                    />
                                    <AvatarFallback className="size-5">
                                      {getUserDisplayName(log.expand?.user)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div>
                                  <div className="text-[9px] text-muted-foreground">
                                    User
                                  </div>
                                  <div className="font-medium text-[10px]">
                                    {log.expand?.user?.username ??
                                      log.expand?.user?.email.split("@")[0]}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-muted/30 rounded-md p-1.5 flex items-center gap-1.5">
                                <div className="bg-primary/10 p-1 rounded-full">
                                  <Smartphone className="h-3 w-3 text-primary" />
                                </div>
                                <div>
                                  <div className="text-[9px] text-muted-foreground">
                                    Device
                                  </div>
                                  <div className="font-medium text-[10px]">
                                    {log.expand?.device.name || "Unknown"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-md p-1.5 flex items-center gap-1.5">
                              <div className="bg-primary/10 p-1 rounded-full">
                                <Calendar className="h-3 w-3 text-primary" />
                              </div>
                              <div>
                                <div className="text-[9px] text-muted-foreground">
                                  Time
                                </div>
                                <div className="font-medium text-[10px]">
                                  {new Date(log.created).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* Parameters section */}
                            {log.parameters &&
                              Object.keys(log.parameters).length > 0 && (
                                <div className="text-[10px] mb-2">
                                  <div className="text-muted-foreground mb-1 font-medium flex items-center gap-0.5">
                                    <Info className="h-2.5 w-2.5" />
                                    <span>Parameters</span>
                                  </div>
                                  <div className="bg-muted/30 p-1.5 rounded-md">
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {Object.entries(log.parameters).map(
                                        ([key, value]) => (
                                          <div
                                            key={key}
                                            className="flex items-center gap-0.5 bg-background/50 p-1 rounded"
                                          >
                                            <span className="text-muted-foreground font-medium">
                                              {key}:
                                            </span>
                                            <span className="font-medium">
                                              {String(value)}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Result section */}
                            {log.result && log.result.success && (
                              <div className="text-[10px]">
                                <div className="text-muted-foreground mb-1 font-medium flex items-center gap-0.5">
                                  {isSuccess ? (
                                    <CheckCircle className="h-2.5 w-2.5 text-green-500" />
                                  ) : (
                                    <XCircle className="h-2.5 w-2.5 text-red-500" />
                                  )}
                                  <span>Result</span>
                                </div>
                                <div
                                  className={cn(
                                    "p-1.5 rounded-md",
                                    isSuccess
                                      ? "bg-green-500/10"
                                      : "bg-red-500/10"
                                  )}
                                >
                                  <pre className="whitespace-pre-wrap break-words text-[10px]">
                                    {JSON.stringify(
                                      log.result?.output,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

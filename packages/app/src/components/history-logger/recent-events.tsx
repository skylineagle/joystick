import {
  getActionDisplayName,
  getUserDisplayName,
} from "@/components/history-logger/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Clock, Info, Smartphone } from "lucide-react";
import { useEffect } from "react";

export function RecentEvents() {
  const queryClient = useQueryClient();
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
      pb.collection("action_logs").unsubscribe();
    };
  }, [queryClient]);

  return (
    <Card className="m-1 shadow-2xl">
      <CardHeader className="p-3 m-0">
        <CardTitle className="text-muted-foreground">Recent Events</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea>
          <div className="flex flex-col gap-2 p-0">
            <AnimatePresence mode="popLayout">
              {recentLogs?.items.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className={cn(
                    "flex items-center justify-between p-1.5 rounded-md text-xs transition-colors group gap-3",
                    "hover:bg-accent cursor-pointer",
                    log.result?.success
                      ? "border-l-2 border-l-green-500"
                      : "border-l-2 border-l-red-500"
                  )}
                >
                  <div className="flex items-center gap-1.5 flex-1">
                    <Avatar className="size-5">
                      <AvatarImage
                        src={`${urls.pocketbase}/api/files/${log.expand?.user?.collectionId}/${log.expand?.user?.id}/${log.expand?.user?.avatar}`}
                        alt={
                          log.expand?.user?.username || log.expand?.user?.email
                        }
                      />
                      <AvatarFallback className="size-5">
                        {getUserDisplayName(log.expand?.user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="break-words">
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
                                    <span className="text-muted">{key}:</span>
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
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Smartphone className="h-3 w-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="text-xs">
                          {log.expand?.device.name || "Unknown"}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDevice } from "@/hooks/use-device";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { useIsSupported } from "@/hooks/use-is-supported";
import { joystickApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { FocusedEvent } from "@/pages/gallery/focused-event";
import { GalleryStats } from "@/pages/gallery/gallery-stats";
import { useGalleryEvents } from "@/pages/gallery/use-gallery-events";
import { getEventState } from "@/pages/gallery/utils";
import { VirtualizedGallery } from "@/pages/gallery/virtualized-gallery";
import { GalleryResponse } from "@/types/db.types";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { Loader2, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { GalleryBatchOperations } from "./gallery-batch-operations";
import { GalleryFilters } from "./gallery-filters";

export interface GalleryStats {
  totalEvents: number;
  newEvents: number;
  pulledEvents: number;
  viewedEvents: number;
  byMediaType?: Record<string, number>;
}

type ViewMode = "grid" | "list";
type SortOrder = "newest" | "oldest";
type EventState = "all" | "new" | "pulled" | "viewed" | "flagged";

export function GalleryPage() {
  const { device: deviceId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [scope, animate] = useAnimate();
  const { data: device } = useDevice(deviceId!);
  const [focusedEvent, setFocusedEvent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<EventState>("all");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);

  const { isSupported, isLoading } = useIsSupported(
    deviceId!,
    ["list-events", "list-media", "list-files"],
    "any"
  );

  // Fetch gallery events with infinite scrolling
  const {
    events,
    totalCount,
    isLoading: isLoadingEvents,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useGalleryEvents(deviceId!, {
    searchQuery,
    selectedState,
    selectedMediaTypes,
    sortOrder,
  });

  const { data: galleryStatus } = useQuery({
    queryKey: ["gallery", deviceId, "status"],
    queryFn: async () => {
      const data = await joystickApi.get<{
        status: "running" | "stopped";
        isProcessing: boolean;
      }>(`${urls.studio}/api/gallery/${deviceId}/status`);
      return data;
    },
    // Increase polling frequency to catch state changes faster
    refetchInterval: 5000,
  });
  const isRouteAllowed = useIsRouteAllowed("gallery");

  // Start gallery service
  const startMutation = useMutation({
    mutationFn: async () => {
      const data = await joystickApi.post(
        `${urls.studio}/api/gallery/${deviceId}/start`,
        {
          interval: device?.information?.harvest?.interval ?? 60,
          autoPull: device?.information?.harvest?.autoPull ?? false,
        }
      );
      return data;
    },
    onSuccess: () => {
      toast.success({
        message: "Gallery service started",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error
            ? error.message
            : "Failed to start gallery service",
      });
    },
  });

  // Stop gallery service
  const stopMutation = useMutation({
    mutationFn: async () => {
      const data = await joystickApi.post(
        `${urls.studio}/api/gallery/${deviceId}/stop`,
        {}
      );
      return data;
    },
    onSuccess: () => {
      toast.success({
        message: "Gallery service stopped",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error
            ? error.message
            : "Failed to stop gallery service",
      });
    },
  });

  const updateHarvestingIntervalMutation = useMutation({
    mutationFn: async (interval: number) => {
      await pb.collection("devices").update(deviceId!, {
        information: {
          ...device?.information,
          harvest: {
            ...device?.information?.harvest,
            interval,
          },
        },
      });
    },
  });

  const updateHarvestingAutoPullMutation = useMutation({
    mutationFn: async (autoPull: boolean) => {
      await pb.collection("devices").update(deviceId!, {
        information: {
          ...device?.information,
          harvest: {
            ...device?.information?.harvest,
            autoPull,
          },
        },
      });
    },
  });

  const handleServiceToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await startMutation.mutateAsync();
      } else {
        await stopMutation.mutateAsync();
      }
    } catch {
      // If the mutation fails, force refetch status to ensure UI is in sync
      queryClient.invalidateQueries({
        queryKey: ["gallery", deviceId, "status"],
      });
    }
  };

  const handleFocusEvent = async (event: GalleryResponse) => {
    setFocusedEvent(event.id);
    await animate(
      "img",
      { scale: 1.05, opacity: 0.8 },
      { duration: 0.3, ease: "easeOut" }
    );
  };

  // Apply client-side state filtering (since PocketBase doesn't support complex state filtering)
  const filteredEvents = events?.filter((event) => {
    if (selectedState === "all") return true;
    if (selectedState === "flagged") return event.flagged;
    return getEventState(event, user?.id || "") === selectedState;
  });

  // Bulk actions
  const bulkViewMutation = useMutation({
    mutationFn: async (eventIds: string[]) => {
      await Promise.all(
        eventIds.map((id) =>
          pb.collection("gallery").update(id, {
            "viewed+": user?.id,
          })
        )
      );
    },
    onSuccess: () => {
      toast.success({
        message: "Events marked as viewed",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
      setSelectedEvents(new Set());
    },
  });

  const bulkPullMutation = useMutation({
    mutationFn: async (eventIds: string[]) => {
      const responses = await Promise.all(
        eventIds.map((id) =>
          joystickApi.post(
            `${urls.studio}/api/gallery/${deviceId}/pull/${id}`,
            {}
          )
        )
      );
      return responses;
    },
    onSuccess: () => {
      toast.success({
        message: "Events pulled",
      });
      // Invalidate both gallery and device queries to ensure everything is up to date
      queryClient.invalidateQueries({
        queryKey: ["gallery"],
      });
      queryClient.invalidateQueries({
        queryKey: ["device", deviceId],
      });
      setSelectedEvents(new Set());
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error ? error.message : "Failed to pull events",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (eventIds: string[]) => {
      await Promise.all(
        eventIds.map((id) => pb.collection("gallery").delete(id))
      );
    },
    onSuccess: () => {
      toast.success({
        message: "Events deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
      setSelectedEvents(new Set());
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error ? error.message : "Failed to delete events",
      });
    },
  });

  const bulkFlagMutation = useMutation({
    mutationFn: async (eventIds: string[]) => {
      await Promise.all(
        eventIds.map((id) =>
          pb.collection("gallery").update(id, { flagged: true })
        )
      );
    },
    onSuccess: () => {
      toast.success({
        message: "Events flagged",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
      setSelectedEvents(new Set());
    },
  });

  const bulkUnflagMutation = useMutation({
    mutationFn: async (eventIds: string[]) => {
      await Promise.all(
        eventIds.map((id) =>
          pb.collection("gallery").update(id, { flagged: false })
        )
      );
    },
    onSuccess: () => {
      toast.success({
        message: "Events unflagged",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
      setSelectedEvents(new Set());
    },
  });

  const handleBulkAction = (
    action: "view" | "pull" | "delete" | "flag" | "unflag"
  ) => {
    if (action === "view") {
      bulkViewMutation.mutate(Array.from(selectedEvents));
    } else if (action === "pull") {
      bulkPullMutation.mutate(Array.from(selectedEvents));
    } else if (action === "delete") {
      bulkDeleteMutation.mutate(Array.from(selectedEvents));
    } else if (action === "flag") {
      bulkFlagMutation.mutate(Array.from(selectedEvents));
    } else if (action === "unflag") {
      bulkUnflagMutation.mutate(Array.from(selectedEvents));
    }
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const selectAllEvents = useCallback(() => {
    if (filteredEvents) {
      setSelectedEvents(new Set(filteredEvents.map((event) => event.id)));
    }
  }, [filteredEvents]);

  const clearSelection = () => {
    setSelectedEvents(new Set());
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "a" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        selectAllEvents();
      } else if (event.key === "Escape") {
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredEvents, selectAllEvents]);

  if (!isRouteAllowed) {
    return <div>You are not allowed to access this page</div>;
  }

  if (isLoadingEvents || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-8 w-8 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grow size-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6"
        >
          <div className="flex items-center space-x-6">
            <GalleryStats deviceId={deviceId!} />
          </div>
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        checked={device?.harvesting}
                        onCheckedChange={handleServiceToggle}
                        disabled={
                          !isSupported ||
                          startMutation.isPending ||
                          stopMutation.isPending
                        }
                        className={cn(
                          "data-[state=checked]:bg-green-600",
                          device?.harvesting ? "bg-green-600/30" : ""
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  {!isSupported && (
                    <TooltipContent>
                      <p>Device doesn't support automatic harvesting.</p>
                      <p>Events must be posted manually to the server.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <span className="text-sm text-muted-foreground">
                  {device?.harvesting ? "Harvesting" : "Stopped"}
                </span>
              </div>
              <Tooltip>
                <Popover>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            !isSupported ||
                            galleryStatus?.status === "running" ||
                            startMutation.isPending ||
                            stopMutation.isPending
                          }
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">
                          Gallery Settings
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Configure the gallery service behavior
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="interval">
                            Scan interval (seconds)
                          </Label>
                          <Input
                            id="interval"
                            type="number"
                            value={device?.information?.harvest?.interval}
                            onChange={(e) =>
                              updateHarvestingIntervalMutation.mutate(
                                Number(e.target.value)
                              )
                            }
                            min={30}
                            step={30}
                            className="h-8"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-pull">Auto pull events</Label>
                          <Switch
                            id="auto-pull"
                            checked={
                              device?.information?.harvest?.autoPull ?? false
                            }
                            onCheckedChange={(checked) =>
                              updateHarvestingAutoPullMutation.mutate(checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                  {!isSupported && (
                    <TooltipContent>
                      <p>Gallery settings unavailable.</p>
                      <p>Device doesn't support automatic harvesting.</p>
                    </TooltipContent>
                  )}
                </Popover>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <div className="p-6 pb-4">
          <GalleryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedState={selectedState}
            onStateChange={setSelectedState}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            selectedMediaTypes={selectedMediaTypes}
            onMediaTypesChange={setSelectedMediaTypes}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalEvents={totalCount}
            filteredCount={filteredEvents?.length || 0}
          />
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedEvents.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6"
            >
              <GalleryBatchOperations
                selectedEvents={selectedEvents}
                events={events || []}
                onClearSelection={clearSelection}
                onBulkAction={handleBulkAction}
                isProcessing={
                  bulkViewMutation.isPending ||
                  bulkPullMutation.isPending ||
                  bulkDeleteMutation.isPending ||
                  bulkFlagMutation.isPending ||
                  bulkUnflagMutation.isPending
                }
                progress={0}
                userId={user?.id || ""}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Gallery Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <AnimatePresence>
          {isLoadingEvents ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Loader2 className="h-8 w-8 animate-spin" />
              </motion.div>
            </div>
          ) : filteredEvents?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-muted-foreground"
            >
              <div className="text-lg font-medium mb-2">No events found</div>
              <div className="text-sm">
                Try adjusting your filters or search query
              </div>
            </motion.div>
          ) : (
            <motion.div
              ref={scope}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <VirtualizedGallery
                events={filteredEvents}
                viewMode={viewMode}
                handleFocusEvent={handleFocusEvent}
                selectedEvents={selectedEvents}
                toggleEventSelection={toggleEventSelection}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FocusedEvent
        focusedEvent={
          events?.find((event) => event.id === focusedEvent) ?? null
        }
        setFocusedEvent={setFocusedEvent}
      />
    </div>
  );
}

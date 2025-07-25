import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { GalleryEvent } from "@/pages/gallery/gallery-event";
import { GalleryStats } from "@/pages/gallery/gallery-stats";
import { useGalleryEvents } from "@/pages/gallery/use-gallery-events";
import { getEventState } from "@/pages/gallery/utils";
import { GalleryResponse } from "@/types/db.types";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import {
  Download,
  Flag,
  Grid,
  List,
  Loader2,
  Search,
  Settings2,
  Trash2,
  View,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

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
  const [autoPull, setAutoPull] = useState(false);
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

  // Fetch gallery events
  const { events, isLoading: isLoadingEvents } = useGalleryEvents(deviceId!);

  const { data: galleryStatus, isLoading: isLoadingStatus } = useQuery({
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
          interval: device?.information?.harvestingInterval ?? 60,
          autoPull,
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
          harvestingInterval: interval,
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

  // Filter and sort events
  const filteredEvents = events
    ?.filter((event) => {
      const matchesSearch = searchQuery
        ? event.event_id.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesState =
        selectedState === "all"
          ? true
          : selectedState === "flagged"
          ? event.flagged
          : getEventState(event, user?.id || "") === selectedState;
      const matchesMediaType =
        selectedMediaTypes.length === 0 ||
        selectedMediaTypes.includes(event.media_type || "unknown");
      return matchesSearch && matchesState && matchesMediaType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created);
      const dateB = new Date(b.created);
      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
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
          fetch(`${urls.studio}/api/gallery/${deviceId}/pull/${id}`, {
            method: "POST",
          }).then(async (res) => {
            if (!res.ok) {
              const error = await res.text();
              throw new Error(error || "Failed to pull event");
            }
            return res;
          })
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-6">
          <GalleryStats deviceId={deviceId!} />
        </div>
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <div className="flex items-center space-x-2">
              {isLoadingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
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
                </>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Tooltip>
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
                  {!isSupported && (
                    <TooltipContent>
                      <p>Gallery settings unavailable.</p>
                      <p>Device doesn't support automatic harvesting.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
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
                      <Label htmlFor="interval">Scan interval (seconds)</Label>
                      <Input
                        id="interval"
                        type="number"
                        value={device?.information?.harvestingInterval}
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
                        checked={autoPull}
                        onCheckedChange={(checked) => setAutoPull(checked)}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </TooltipProvider>
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full md:w-[200px]"
            />
          </div>
          <Select
            value={selectedState}
            onValueChange={(value: EventState) => setSelectedState(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="pulled">Pulled</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value: SortOrder) => setSortOrder(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Media:</span>
            <div className="flex gap-1">
              {["image", "video", "audio", "document"].map((type) => (
                <Button
                  key={type}
                  variant={
                    selectedMediaTypes.includes(type) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setSelectedMediaTypes((prev) =>
                      prev.includes(type)
                        ? prev.filter((t) => t !== type)
                        : [...prev, type]
                    );
                  }}
                  className="h-8 px-3 text-xs"
                >
                  {type === "image"
                    ? "🖼️"
                    : type === "video"
                    ? "🎥"
                    : type === "audio"
                    ? "🎵"
                    : "📄"}
                  <span className="ml-1 hidden sm:inline">{type}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn(viewMode === "grid" && "bg-accent")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn(viewMode === "list" && "bg-accent")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEvents.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 mt-4"
        >
          <Badge variant="secondary" className="ml-2">
            {selectedEvents.size} selected
          </Badge>
          {Array.from(selectedEvents).every((id) => {
            const event = events?.find((e) => e.id === id);
            return event && event.event;
          }) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("view")}
              disabled={bulkViewMutation.isPending}
            >
              <View className="h-4 w-4 mr-2" />
              Mark as Viewed
            </Button>
          )}
          {Array.from(selectedEvents).some((id) => {
            const event = events?.find((e) => e.id === id);
            return event && getEventState(event, user?.id || "") === "new";
          }) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("pull")}
              disabled={bulkPullMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Pull Selected
            </Button>
          )}
          {Array.from(selectedEvents).some((id) => {
            const event = events?.find((e) => e.id === id);
            return event && !event.flagged;
          }) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("flag")}
              disabled={bulkFlagMutation.isPending}
            >
              <Flag className="h-4 w-4 mr-2" />
              Flag Selected
            </Button>
          )}
          {Array.from(selectedEvents).some((id) => {
            const event = events?.find((e) => e.id === id);
            return event && event.flagged;
          }) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("unflag")}
              disabled={bulkUnflagMutation.isPending}
            >
              <Flag className="h-4 w-4 mr-2" />
              Unflag Selected
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleBulkAction("delete")}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </motion.div>
      )}

      {/* Gallery Grid/List */}
      <div className="flex-1 mt-4 overflow-y-auto p-2">
        <AnimatePresence>
          {isLoadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-muted rounded-lg aspect-video"
                />
              ))}
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
              className={cn(
                "gap-2 h-full overflow-y-auto p-2",
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col"
              )}
            >
              {filteredEvents?.map((event, index) => (
                <GalleryEvent
                  key={event.id}
                  event={event}
                  index={index}
                  handleFocusEvent={handleFocusEvent}
                  viewMode={viewMode}
                  isSelected={selectedEvents.has(event.id)}
                  onSelect={() => toggleEventSelection(event.id)}
                />
              ))}
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

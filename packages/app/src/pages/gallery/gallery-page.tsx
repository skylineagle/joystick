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
import { useIsSupported } from "@/hooks/use-is-supported";
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
import { useParams } from "react-router-dom";

export interface GalleryStats {
  totalEvents: number;
  newEvents: number;
  pulledEvents: number;
  viewedEvents: number;
}

interface GalleryConfig {
  interval: number;
  autoPull: boolean;
}

type ViewMode = "grid" | "list";
type SortOrder = "newest" | "oldest";
type EventState = "all" | "new" | "pulled" | "viewed" | "flagged";

export default function GalleryPage() {
  const { device: deviceId } = useParams();
  const queryClient = useQueryClient();
  const [scope, animate] = useAnimate();
  const [config, setConfig] = useState<GalleryConfig>({
    interval: 60,
    autoPull: false,
  });
  const [focusedEvent, setFocusedEvent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<EventState>("all");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const { isSupported, isLoading } = useIsSupported(deviceId!, "list-events");

  // Fetch gallery events
  const { events, isLoading: isLoadingEvents } = useGalleryEvents(deviceId!);

  const { data: isRunning, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["gallery", deviceId, "status"],
    queryFn: async () => {
      const response = await fetch(
        `${urls.studio}/api/gallery/${deviceId}/status`
      );
      if (!response.ok) throw new Error("Failed to fetch gallery status");
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.status === "running";
    },
  });

  // Start gallery service
  const startMutation = useMutation({
    mutationFn: async (config: GalleryConfig) => {
      const response = await fetch(
        `${urls.studio}/api/gallery/${deviceId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
        }
      );
      if (!response.ok) throw new Error("Failed to start gallery service");
      return response.json();
    },
    onSuccess: () => {
      toast.success({
        message: "Gallery service started",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
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
      const response = await fetch(
        `${urls.studio}/api/gallery/${deviceId}/stop`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to stop gallery service");
      return response.json();
    },
    onSuccess: () => {
      toast.success({
        message: "Gallery service stopped",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
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

  const handleServiceToggle = (checked: boolean) => {
    if (checked) {
      startMutation.mutate(config);
    } else {
      stopMutation.mutate();
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
          : getEventState(event) === selectedState;
      return matchesSearch && matchesState;
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
          pb.collection("gallery").update(id, { viewed: true })
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
      await Promise.all(
        eventIds.map((id) =>
          fetch(`${urls.studio}/api/gallery/${deviceId}/pull/${id}`, {
            method: "POST",
          })
        )
      );
    },
    onSuccess: () => {
      toast.success({
        message: "Events pulled",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
      setSelectedEvents(new Set());
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

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-medium mb-2">Device not supported</div>
        <div className="text-sm">
          Please ensure the device has "list-events" action enabled and try
          again.
        </div>
      </div>
    );
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
          <div className="flex items-center space-x-2">
            {isLoadingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Switch
                checked={isRunning}
                onCheckedChange={handleServiceToggle}
                disabled={startMutation.isPending || stopMutation.isPending}
                className="data-[state=checked]:bg-green-600"
              />
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={
                  isRunning || startMutation.isPending || stopMutation.isPending
                }
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Gallery Settings</h4>
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
                      value={config.interval}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          interval: Number(e.target.value),
                        })
                      }
                      min={30}
                      step={30}
                      className="h-8"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-pull">Auto-pull videos</Label>
                    <Switch
                      id="auto-pull"
                      checked={config.autoPull}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, autoPull: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
            return event && getEventState(event) === "new";
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

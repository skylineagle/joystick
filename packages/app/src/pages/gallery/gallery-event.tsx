import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { pb } from "@/lib/pocketbase";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { getEventState } from "@/pages/gallery/utils";
import { GalleryResponse } from "@/types/db.types";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Flag, Loader2, Play } from "lucide-react";

interface GalleryEventProps {
  event: GalleryResponse;
  index: number;
  handleFocusEvent: (event: GalleryResponse) => void;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: () => void;
}

export const GalleryEvent = ({
  event,
  index,
  handleFocusEvent,
  viewMode,
  isSelected,
  onSelect,
}: GalleryEventProps) => {
  const queryClient = useQueryClient();
  const state = getEventState(event);

  const viewMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await pb.collection("gallery").update(eventId, {
        viewed: true,
      });
    },
    onSuccess: () => {
      toast.success({
        message: "Event marked as viewed",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", event.device] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error
            ? error.message
            : "Failed to mark event as viewed",
      });
    },
  });

  const pullMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(
        `${urls.studio}/api/gallery/${event.device}/pull/${eventId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to pull event");
      return response.json();
    },
    onSuccess: () => {
      toast.success({
        message: "Event pulled",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", event.device] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error ? error.message : "Failed to pull event",
      });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await pb.collection("gallery").update(eventId, {
        flagged: !event.flagged,
      });
    },
    onSuccess: () => {
      toast.success({
        message: event.flagged ? "Event unflagged" : "Event flagged",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", event.device] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error
            ? error.message
            : "Failed to update event flag status",
      });
    },
  });

  const handleClick = () => {
    handleFocusEvent(event);
  };

  const EventContent = () => (
    <div className="relative group">
      <div className="aspect-video relative">
        <div
          className={cn(
            "absolute top-2 left-2 z-10 transition-opacity duration-300 opacity-0",
            "group-hover:opacity-100",
            isSelected && "opacity-100"
          )}
        >
          <Checkbox
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onCheckedChange={() => {
              onSelect();
            }}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>

        <motion.img
          src={pb.files.getURL(event, event.thumbnail)}
          alt={`Event ${event.event_id}`}
          className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleFocusEvent(event);
          }}
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300",
            "group-hover:opacity-100",
            isSelected && "opacity-100"
          )}
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant={
              state == "flagged"
                ? "destructive"
                : state === "new"
                ? "disconnected"
                : state === "pulled"
                ? "secondary"
                : "outline"
            }
          >
            {state}
          </Badge>
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300 event-actions",
            "group-hover:opacity-100",
            isSelected && "opacity-100"
          )}
        >
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {state === "new" ? (
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  pullMutation.mutate(event.id);
                }}
                disabled={pullMutation.isPending}
              >
                {pullMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            ) : state === "pulled" ? (
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  viewMutation.mutate(event.id);
                  return window.open(
                    pb.files.getURL(event, event.event),
                    "_blank"
                  );
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(pb.files.getURL(event, event.event), "_blank");
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{event.event_id}</div>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              flagMutation.mutate(event.id);
            }}
            disabled={flagMutation.isPending}
            className={cn(
              "h-8 w-8",
              event.flagged && "text-red-500 hover:text-red-600 hover:bg-red-50"
            )}
          >
            {flagMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Flag className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(event.created).toLocaleString()}
        </div>
      </div>
    </div>
  );

  if (viewMode === "list") {
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "flex items-center gap-4 p-4 rounded-lg border transition-colors",
          isSelected
            ? "bg-accent/50 border-primary"
            : "bg-card hover:bg-accent/50"
        )}
      >
        <EventContent />
      </motion.div>
    );
  }

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={cn(
          "w-full rounded-2xl border",
          state === "new"
            ? "[background:linear-gradient(45deg,#172033,theme(colors.yellow.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.600/.48)_80%,_theme(colors.yellow.500)_86%,_theme(colors.yellow.300)_90%,_theme(colors.yellow.500)_94%,_theme(colors.yellow.600/.48))_border-box] rounded-2xl border border-transparent animate-border"
            : "border-border bg-card"
        )}
      >
        <Card
          className={cn(
            "overflow-hidden group transition-all duration-300 hover:shadow-2xl shadow-lg cursor-pointer",
            {
              "border-yellow-500": state === "new",
              "border-blue-500": state === "pulled",
              "border-gray-500": state === "viewed",
              "border-red-500": state === "flagged",
              "border-primary border-4": isSelected,
            }
          )}
          onClick={handleClick}
        >
          <CardContent className="p-0">
            <EventContent />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

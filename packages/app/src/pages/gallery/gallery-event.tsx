import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pb } from "@/lib/pocketbase";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { getEventState } from "@/pages/gallery/utils";
import { GalleryResponse } from "@/types/db.types";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Loader2, Play } from "lucide-react";

interface GalleryEventProps {
  event: GalleryResponse;
  index: number;
  handleFocusEvent: (event: GalleryResponse) => void;
}

export const GalleryEvent = ({
  event,
  index,
  handleFocusEvent,
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
            }
          )}
          onClick={() => handleFocusEvent(event)}
        >
          <CardContent className="p-0">
            <div className="aspect-video relative">
              <motion.img
                src={pb.files.getURL(event, event.thumbnail)}
                alt={`Event ${event.event_id}`}
                className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                whileHover={{ scale: 1.05 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-2 right-2">
                <Badge
                  variant={
                    state === "new"
                      ? "disconnected"
                      : state === "pulled"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {state}
                </Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                  <div className="flex gap-2">
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
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        pb.files.getURL(event, event.event),
                        "_blank"
                      );
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="text-sm font-medium">{event.event_id}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(event.created).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

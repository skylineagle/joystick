import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { joystickApi } from "@/lib/api-client";
import { pb } from "@/lib/pocketbase";
import { urls } from "@/lib/urls";
import { getEventState } from "@/pages/gallery/utils";
import { GalleryResponse } from "@/types/db.types";
import { toast } from "@/utils/toast";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { animate, motion } from "framer-motion";
import { Download, Loader2, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

interface FocusedEventProps {
  focusedEvent: GalleryResponse | null;
  setFocusedEvent: (event: string | null) => void;
}

export const FocusedEvent = ({
  focusedEvent,
  setFocusedEvent,
}: FocusedEventProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const queryClient = useQueryClient();

  const pullMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await joystickApi.post(
        `${urls.studio}/api/gallery/${focusedEvent?.device}/pull/${eventId}`,
        {}
      );
    },
    onSuccess: () => {
      toast.success({
        message: "Event pulled",
      });
      queryClient.invalidateQueries({
        queryKey: ["gallery", focusedEvent?.device],
      });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error ? error.message : "Failed to pull event",
      });
    },
  });

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
      queryClient.invalidateQueries({
        queryKey: ["gallery", focusedEvent?.device],
      });
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

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      if (focusedEvent) {
        viewMutation.mutate(focusedEvent.id);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleUnfocusEvent = async () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    await animate(
      "img",
      { scale: 1, opacity: 1 },
      { duration: 0.3, ease: "easeOut" }
    );
    setFocusedEvent(null);
  };

  return (
    <Dialog open={!!focusedEvent} onOpenChange={() => handleUnfocusEvent()}>
      <DialogTitle>
        <DialogDescription />
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0">
        {focusedEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="aspect-video relative">
              {getEventState(focusedEvent) === "new" ? (
                <img
                  src={pb.files.getURL(focusedEvent, focusedEvent.thumbnail)}
                  alt={`Event ${focusedEvent.id}`}
                  className="size-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={pb.files.getURL(focusedEvent, focusedEvent.event)}
                  className="size-full object-contain"
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    toast.error({
                      message: "Failed to play video",
                    });
                    setIsPlaying(false);
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Event {focusedEvent.id}
                    </h3>
                    <p className="text-sm text-white/80">
                      {new Date(focusedEvent.created).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getEventState(focusedEvent) === "new" ? (
                      <Button
                        variant="secondary"
                        onClick={() => pullMutation.mutate(focusedEvent.id)}
                        disabled={pullMutation.isPending}
                      >
                        {pullMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Pull Event
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={handlePlayPause}>
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? "Pause" : "Play"} Event
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

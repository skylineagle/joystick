import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { joystickApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { urls } from "@/lib/urls";
import { getEventState } from "@/pages/gallery/utils";
import { GalleryResponse } from "@/types/db.types";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Image,
  Loader2,
  Music,
  Pause,
  Play,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";

interface FocusedEventProps {
  focusedEvent: GalleryResponse | null;
  setFocusedEvent: (event: string | null) => void;
}

export const FocusedEvent = ({
  focusedEvent,
  setFocusedEvent,
}: FocusedEventProps) => {
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const queryClient = useQueryClient();

  const pullMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await joystickApi.post(
        `${urls.studio}/api/gallery/${focusedEvent?.device}/pull/${eventId}`,
        {}
      );
      if (!response) {
        throw new Error("Failed to pull event");
      }
      return response;
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
        "viewed+": user?.id,
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

  const handleClose = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setFocusedEvent(null);
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case "video":
        return <Video className="h-6 w-6" />;
      case "image":
        return <Image className="h-6 w-6" />;
      case "audio":
        return <Music className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const renderMedia = () => {
    if (!focusedEvent?.event) return null;

    const url = pb.files.getURL(focusedEvent, focusedEvent.event);

    switch (focusedEvent.media_type) {
      case "video":
        return (
          <video
            ref={videoRef}
            src={url}
            className="max-h-[80vh] w-auto"
            controls={false}
            onEnded={() => setIsPlaying(false)}
          />
        );
      case "image":
        return (
          <img
            src={url}
            alt={focusedEvent.event_id}
            className="max-h-[80vh] w-auto object-contain"
          />
        );
      case "audio":
        return (
          <audio
            ref={videoRef}
            src={url}
            className="w-full"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <FileText className="h-16 w-16 mb-4 text-muted-foreground" />
            <Button
              variant="outline"
              onClick={() => window.open(url, "_blank")}
            >
              Open File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={!!focusedEvent} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {focusedEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="flex items-center justify-center bg-black/95 p-4">
                {renderMedia()}
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {getMediaIcon(focusedEvent.media_type || "unknown")}
                      {focusedEvent.name || focusedEvent.event_id}
                    </h3>
                    <p className="text-sm text-white/80">
                      {new Date(focusedEvent.created).toLocaleString()}
                    </p>
                    {focusedEvent.file_size && (
                      <p className="text-sm text-white/60">
                        Size:{" "}
                        {(focusedEvent.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {getEventState(focusedEvent, user?.id || "") === "new" ? (
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
                    ) : focusedEvent.media_type === "video" ||
                      focusedEvent.media_type === "audio" ? (
                      <Button variant="secondary" onClick={handlePlayPause}>
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            pb.files.getURL(focusedEvent, focusedEvent.event),
                            "_blank"
                          )
                        }
                      >
                        Open File
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

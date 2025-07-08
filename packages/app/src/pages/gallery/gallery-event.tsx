import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { joystickApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { GalleryResponse } from "@/types/db.types";
import { MetadataValue } from "@/types/types";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowDown,
  Download,
  Eye,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FileText,
  FileVideo,
  Flag,
  Loader2,
  Play,
} from "lucide-react";

const formatFileSize = (bytes: number) => {
  if (!bytes) return null;
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB`;
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

interface GalleryEventProps {
  event: GalleryResponse<Record<string, MetadataValue>>;
  index: number;
  handleFocusEvent: (event: GalleryResponse) => void;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: () => void;
}

const getFileIcon = (mediaType: string, name: string) => {
  const extension = name?.split(".").pop()?.toLowerCase();

  switch (mediaType) {
    case "video":
      return <FileVideo className="h-4 w-4 text-blue-500" />;
    case "audio":
      return <FileAudio className="h-4 w-4 text-purple-500" />;
    case "image":
      return <FileImage className="h-4 w-4 text-green-500" />;
    default:
      switch (extension) {
        case "txt":
        case "log":
          return <FileText className="h-4 w-4 text-gray-500" />;
        case "json":
          return <FileJson className="h-4 w-4 text-yellow-500" />;
        case "zip":
        case "tar":
        case "gz":
          return <FileArchive className="h-4 w-4 text-orange-500" />;
        case "js":
        case "ts":
        case "py":
        case "cpp":
          return <FileCode className="h-4 w-4 text-cyan-500" />;
        default:
          return <File className="h-4 w-4 text-gray-500" />;
      }
  }
};

const isPreviewable = (mediaType: string) => {
  return ["video", "image", "audio"].includes(mediaType);
};

export function GalleryEvent({
  event,
  index,
  handleFocusEvent,
  viewMode,
  isSelected,
  onSelect,
}: GalleryEventProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const state = event.flagged
    ? "flagged"
    : !event.event
    ? "new"
    : event.viewed?.includes(user?.id || "")
    ? "viewed"
    : "pulled";

  const pullMutation = useMutation({
    mutationFn: async () => {
      console.log("pulling event", event.id, event.device);
      const response = await joystickApi.post(
        `${urls.studio}/api/gallery/${event.device}/pull/${event.id}`,
        {}
      );

      return response;
    },
    onSuccess: () => {
      toast.success({
        message: "Event pulled successfully",
      });
      // Invalidate both gallery and device queries to ensure everything is up to date
      queryClient.invalidateQueries({
        queryKey: ["gallery"],
      });
      queryClient.invalidateQueries({
        queryKey: ["device", event.device],
      });
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
      await pb
        .collection("gallery")
        .update(eventId, { flagged: !event.flagged });
    },
    onSuccess: () => {
      toast.success({
        message: event.flagged ? "Event unflagged" : "Event flagged",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", event.device] });
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await pb.collection("gallery").update(eventId, {
        "viewed+": user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", event.device] });
    },
  });

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pb.files.getURL(event, event.event);
    link.download = event.name || event.event_id;
    link.click();
    if (!event.viewed?.includes(user?.id || "")) {
      viewMutation.mutate(event.id);
    }
  };

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
        <Checkbox
          checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onCheckedChange={() => {
            onSelect();
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getFileIcon(event.media_type, event.name)}
            <span className="font-medium truncate">
              {event.name || event.event_id}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(event.created)}</span>
            {event.file_size && <span>{formatFileSize(event.file_size)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              state === "flagged"
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
          {state === "new" ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                pullMutation.mutate();
              }}
              disabled={pullMutation.isPending}
            >
              {pullMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPreviewable(event.media_type)) {
                    handleFocusEvent(event);
                  } else {
                    handleDownload();
                  }
                }}
              >
                {isPreviewable(event.media_type) ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              {!isPreviewable(event.media_type) &&
                !event.viewed?.includes(user?.id || "") && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewMutation.mutate(event.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
            </>
          )}
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
      </motion.div>
    );
  }

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "group relative rounded-lg border overflow-hidden bg-card transition-colors h-fit",
        isSelected && "border-primary"
      )}
    >
      {isPreviewable(event.media_type) ? (
        <div
          className="aspect-video relative cursor-pointer"
          onClick={() => handleFocusEvent(event)}
        >
          {event.thumbnail && (
            <img
              src={pb.files.getURL(event, event.thumbnail)}
              alt={event.name || event.event_id}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-muted/30 p-4">
          {getFileIcon(event.media_type, event.name)}
          <span className="ml-2 text-sm font-medium truncate">
            {event.name?.split(".").pop()?.toUpperCase()}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <Badge
              variant={
                state === "flagged"
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
          <div className="flex items-center gap-1">
            {state === "new" ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  pullMutation.mutate();
                }}
                disabled={pullMutation.isPending}
              >
                {pullMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            ) : (
              !isPreviewable(event.media_type) && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!event.viewed?.includes(user?.id || "") && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewMutation.mutate(event.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                flagMutation.mutate(event.id);
              }}
              disabled={flagMutation.isPending}
              className={cn(
                event.flagged &&
                  "text-red-500 hover:text-red-600 hover:bg-red-50"
              )}
            >
              {flagMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flag className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getFileIcon(event.media_type, event.name)}
            <span className="text-sm font-medium truncate">
              {event.name || event.event_id}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(event.created)}</span>
            {event.file_size && <span>{formatFileSize(event.file_size)}</span>}
          </div>
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {Object.entries(event.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="font-medium">{key}:</span>
                  <span className="truncate">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

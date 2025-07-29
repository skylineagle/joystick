import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { GalleryResponse } from "@/types/db.types";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Flag,
  Trash2,
  X,
} from "lucide-react";
import { getEventState } from "./utils";

interface GalleryBatchOperationsProps {
  selectedEvents: Set<string>;
  events: GalleryResponse[];
  onClearSelection: () => void;
  onBulkAction: (
    action: "view" | "pull" | "delete" | "flag" | "unflag"
  ) => void;
  isProcessing: boolean;
  progress?: number;
  userId: string;
}

export function GalleryBatchOperations({
  selectedEvents,
  events,
  onClearSelection,
  onBulkAction,
  isProcessing,
  progress,
  userId,
}: GalleryBatchOperationsProps) {
  if (selectedEvents.size === 0) return null;

  const selectedEventObjects = events.filter((event) =>
    selectedEvents.has(event.id)
  );

  const canView = selectedEventObjects.every((event) => event.event);
  const canPull = selectedEventObjects.some(
    (event) => getEventState(event, userId) === "new"
  );
  const canFlag = selectedEventObjects.some((event) => !event.flagged);
  const canUnflag = selectedEventObjects.some((event) => event.flagged);

  const getEventStateIcon = (event: GalleryResponse) => {
    const state = getEventState(event, userId);
    switch (state) {
      case "new":
        return <AlertCircle className="h-3 w-3 text-orange-500" />;
      case "pulled":
        return <Download className="h-3 w-3 text-blue-500" />;
      case "viewed":
        return <Eye className="h-3 w-3 text-green-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getEventStateLabel = (event: GalleryResponse) => {
    const state = getEventState(event, userId);
    switch (state) {
      case "new":
        return "New";
      case "pulled":
        return "Pulled";
      case "viewed":
        return "Viewed";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {selectedEvents.size} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>States:</span>
            {Array.from(
              new Set(selectedEventObjects.map(getEventStateLabel))
            ).map((state) => (
              <Badge key={state} variant="outline" className="text-xs h-5">
                {state}
              </Badge>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Batch Operations</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {canView && (
              <DropdownMenuItem
                disabled={isProcessing}
                onClick={() => onBulkAction("view")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Mark as Viewed
              </DropdownMenuItem>
            )}

            {canPull && (
              <DropdownMenuItem
                disabled={isProcessing}
                onClick={() => onBulkAction("pull")}
              >
                <Download className="mr-2 h-4 w-4" />
                Pull Selected
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {canFlag && (
              <DropdownMenuItem
                disabled={isProcessing}
                onClick={() => onBulkAction("flag")}
              >
                <Flag className="mr-2 h-4 w-4" />
                Flag Selected
              </DropdownMenuItem>
            )}

            {canUnflag && (
              <DropdownMenuItem
                disabled={isProcessing}
                onClick={() => onBulkAction("unflag")}
              >
                <Flag className="mr-2 h-4 w-4" />
                Unflag Selected
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={isProcessing}
              className="text-destructive focus:text-destructive"
              onClick={() => onBulkAction("delete")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isProcessing && (
        <div className="px-3">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Processing... {progress ? Math.round(progress) : 0}%
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
        {selectedEventObjects.slice(0, 6).map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-2 p-2 bg-background rounded border text-xs"
          >
            {getEventStateIcon(event)}
            <span className="truncate flex-1">
              {event.name || event.event_id}
            </span>
            {event.flagged && <Flag className="h-3 w-3 text-red-500" />}
          </div>
        ))}
        {selectedEventObjects.length > 6 && (
          <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
            +{selectedEventObjects.length - 6} more
          </div>
        )}
      </div>
    </div>
  );
}

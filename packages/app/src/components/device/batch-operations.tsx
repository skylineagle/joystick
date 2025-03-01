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
import { batchDeleteDevices, batchSetDeviceMode } from "@/lib/device";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Clock, Power, PowerOff, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "@/utils/toast";

interface BatchOperationsProps {
  selectedDevices: string[];
  onClearSelection: () => void;
}

interface BatchOperationResult {
  succeeded: number;
  failed: number;
  total: number;
}

const modeConfig = {
  live: {
    color: "text-green-500",
  },
  offline: {
    color: "text-slate-500",
  },
  auto: {
    color: "text-blue-500",
  },
} as const;

export function BatchOperations({
  selectedDevices,
  onClearSelection,
}: BatchOperationsProps) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const { mutate: batchDelete, isPending: isDeleting } = useMutation<
    BatchOperationResult,
    Error,
    string[]
  >({
    mutationFn: async (ids: string[]) => {
      setProgress(0);
      return batchDeleteDevices(ids, (current, total) => {
        setProgress((current / total) * 100);
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["cameras"] });
      toast.success({
        message: `Successfully deleted ${result.succeeded} out of ${result.total} cameras`,
      });
      if (result.failed > 0) {
        toast.error({
          message: `Failed to delete ${result.failed} cameras`,
        });
      }
      onClearSelection();
      setProgress(0);
    },
  });

  const { mutate: batchSetMode, isPending: isUpdating } = useMutation<
    BatchOperationResult,
    Error,
    { ids: string[]; mode: string }
  >({
    mutationFn: async ({ ids, mode }) => {
      setProgress(0);
      return batchSetDeviceMode(ids, mode, (current, total) => {
        setProgress((current / total) * 100);
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["cameras"] });
      toast.success({
        message: `Successfully updated ${result.succeeded} out of ${result.total} cameras`,
      });
      if (result.failed > 0) {
        toast.error({
          message: `Failed to update ${result.failed} cameras`,
        });
      }
      onClearSelection();
      setProgress(0);
    },
  });

  const isProcessing = isDeleting || isUpdating;

  if (selectedDevices.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <span className="text-sm text-muted-foreground">
          {selectedDevices.length} selected
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Batch Operations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isProcessing}
              onClick={() =>
                batchSetMode({
                  ids: selectedDevices,
                  mode: "live",
                })
              }
            >
              <Power className={cn("mr-2 h-4 w-4", modeConfig["live"].color)} />
              Set to Live Mode
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isProcessing}
              onClick={() =>
                batchSetMode({
                  ids: selectedDevices,
                  mode: "auto",
                })
              }
            >
              <Clock className={cn("mr-2 h-4 w-4", modeConfig["auto"].color)} />
              Set to Auto Mode
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isProcessing}
              onClick={() =>
                batchSetMode({
                  ids: selectedDevices,
                  mode: "offline",
                })
              }
            >
              <PowerOff
                className={cn("mr-2 h-4 w-4", modeConfig["offline"].color)}
              />
              Set to Offline Mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isProcessing}
              className="text-destructive focus:text-destructive"
              onClick={() => batchDelete(selectedDevices)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isProcessing && (
        <div className="px-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Processing... {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
}

import { GripHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type BaseCardConfig } from "@/types/dashboard-cards";
import { useDevice } from "@/hooks/use-device";

interface BaseCardProps<T extends BaseCardConfig> {
  config: T;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
  children?: React.ReactNode;
  hideDeviceBadge?: boolean;
}

export const BaseCard = <T extends BaseCardConfig>({
  config,
  isEditing,
  onEdit,
  children,
  hideDeviceBadge = false,
}: BaseCardProps<T>) => {
  const { data: device } = useDevice(
    "deviceId" in config && typeof config.deviceId === "string"
      ? config.deviceId
      : undefined
  );

  return (
    <div
      className={cn(
        "w-full h-full bg-card text-card-foreground rounded-xl overflow-hidden",
        "border border-border",
        "shadow-2xl transition-all duration-200",
        "flex flex-col relative group"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between h-12 min-h-[3rem] shrink-0",
          "px-4",
          "bg-background/50 backdrop-blur-sm",
          "border-b border-border",
          isEditing ? "cursor-grab active:cursor-grabbing" : ""
        )}
      >
        {!hideDeviceBadge && (
          <Badge
            variant="secondary"
            className={cn(
              "px-3 py-1",
              "shadow-sm hover:shadow-md transition-shadow"
            )}
          >
            {device?.name ?? "Unknown"}
          </Badge>
        )}

        {isEditing && (
          <div className="flex-1 flex justify-center">
            <div className="drag-handle p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              <GripHorizontal className="size-6" />
            </div>
          </div>
        )}

        {isEditing && (
          <button
            onClick={() => onEdit?.(config.id)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            aria-label="Edit card"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>

      <div
        className={cn(
          "flex-1 min-h-0",
          "bg-gradient-to-br from-background to-background/50",
          "overflow-auto"
        )}
      >
        <div className="p-4 h-full">{children}</div>
      </div>
    </div>
  );
};

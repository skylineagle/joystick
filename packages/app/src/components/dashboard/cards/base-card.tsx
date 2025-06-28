import { GripHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type BaseCardConfig } from "@/types/dashboard-cards";
import { useDevice } from "@/hooks/use-device";
import { motion } from "framer-motion";

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
    <motion.div
      layout
      whileHover={!isEditing ? { scale: 1.01, y: -2 } : undefined}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        layout: { duration: 0.3 },
      }}
      className={cn(
        "w-full h-full bg-card text-card-foreground rounded-xl overflow-hidden",
        "border border-border/50",
        "shadow-lg hover:shadow-2xl transition-all duration-300",
        "flex flex-col relative group",
        "backdrop-blur-sm",
        isEditing && "hover:border-primary/50 hover:shadow-primary/10"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between h-12 min-h-[3rem] shrink-0",
          "px-4",
          "bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md",
          "border-b border-border/50",
          "relative overflow-hidden"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {!hideDeviceBadge && (
          <Badge
            variant="secondary"
            className={cn(
              "px-3 py-1 relative z-10",
              "shadow-sm hover:shadow-md transition-all duration-200",
              "bg-background/80 backdrop-blur-sm border border-border/50",
              "text-xs font-medium"
            )}
          >
            {device?.name ?? "Unknown"}
          </Badge>
        )}

        {isEditing && (
          <div className="flex-1 flex justify-center">
            <div className="drag-handle p-2 rounded-md hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 relative z-10 cursor-grab active:cursor-grabbing">
              <GripHorizontal className="size-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {isEditing && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit?.(config.id)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 relative z-10",
              "hover:bg-accent/50 hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              "bg-background/50 backdrop-blur-sm border border-border/30"
            )}
            aria-label="Edit card"
          >
            <Pencil
              size={14}
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          </motion.button>
        )}
      </div>

      <div
        className={cn(
          "flex-1 min-h-0",
          "bg-gradient-to-br from-background/95 via-background/90 to-muted/20",
          "overflow-hidden relative dashboard-card-content"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/[0.02] pointer-events-none" />
        <div className="p-4 h-full relative z-10 scrollable-content">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

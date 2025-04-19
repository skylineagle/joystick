import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GripHorizontal, Pencil } from "lucide-react";
import { type ReactNode } from "react";

export interface CardConfig {
  id: string;
  deviceId: string;
  visualizationType: string;
}

interface DashboardCardProps {
  config: CardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
  children: ReactNode;
}

export const DashboardCard = ({
  config,
  isEditing,
  onEdit,
  children,
}: DashboardCardProps) => {
  return (
    <div
      className={cn(
        // Base card styles with neomorphic design
        "w-full h-full bg-card text-card-foreground rounded-xl overflow-hidden",
        "border border-border",
        "shadow-2xl transition-all duration-200",
        "flex flex-col relative group"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between h-12 px-4",
          "bg-background/50 backdrop-blur-sm",
          "border-b border-border",
          isEditing ? "cursor-grab active:cursor-grabbing" : ""
        )}
      >
        <Badge
          variant="secondary"
          className={cn(
            "px-3 py-1",
            "shadow-sm hover:shadow-md transition-shadow"
          )}
        >
          {config.visualizationType}
        </Badge>

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

      {children}
    </div>
  );
};

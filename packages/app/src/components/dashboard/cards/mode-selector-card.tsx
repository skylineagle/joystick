import { ModeSelector } from "@/components/device/mode-selector";
import { useDevice } from "@/hooks/use-device";
import type { ModeSelectorCardConfig } from "@/types/dashboard-cards";
import { BaseCard } from "./base-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

interface ModeSelectorCardProps {
  config: ModeSelectorCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const ModeSelectorCard = ({
  config,
  isEditing,
  onEdit,
}: ModeSelectorCardProps) => {
  const { data: device, isLoading, error } = useDevice(config.deviceId);

  if (isLoading) {
    return (
      <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </BaseCard>
    );
  }

  if (error || !device) {
    return (
      <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Device not found"}
          </AlertDescription>
        </Alert>
      </BaseCard>
    );
  }

  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <div className="flex flex-col gap-4 h-full">
        <ModeSelector device={device} />
      </div>
    </BaseCard>
  );
};

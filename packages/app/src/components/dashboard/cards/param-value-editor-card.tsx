import { BaseCard } from "./base-card";
import type { ParamValueEditorCardConfig } from "@/types/dashboard-cards";

interface ParamValueEditorCardProps {
  config: ParamValueEditorCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const ParamValueEditorCard = ({
  config,
  isEditing,
  onEdit,
}: ParamValueEditorCardProps) => {
  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground italic">
          Parameter editor for device {config.deviceId}
          <br />
          Parameter: {config.paramKey} ({config.paramConfig.type})
        </p>
      </div>
    </BaseCard>
  );
};

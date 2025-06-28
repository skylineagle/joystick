import { PtzControl } from "@/pages/stream-view/controls/ptz/ptz-control";
import type { PTZControlCardConfig } from "@/types/dashboard-cards";
import { BaseCard } from "./base-card";

interface PTZControlCardProps {
  config: PTZControlCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const PTZControlCard: React.FC<PTZControlCardProps> = ({
  config,
  isEditing,
  onEdit,
}) => {
  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <div className="h-full w-full overflow-auto">
        <PtzControl deviceId={config.deviceId} />
      </div>
    </BaseCard>
  );
};

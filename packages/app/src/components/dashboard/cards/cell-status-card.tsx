import { BaseCard } from "./base-card";
import type { CellStatusCardConfig } from "@/types/dashboard-cards";
import { CellularStatus } from "@/pages/status/cellular-status";

interface CellStatusCardProps {
  config: CellStatusCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const CellStatusCard = ({
  config,
  isEditing,
  onEdit,
}: CellStatusCardProps) => {
  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <div className="h-full w-full overflow-auto">
        <CellularStatus deviceId={config.deviceId} />
      </div>
    </BaseCard>
  );
};

import { BaseCard } from "./base-card";
import type { BatteryStatusCardConfig } from "@/types/dashboard-cards";
import { BatteryStatus } from "@/pages/status/battery-status";

interface BatteryStatusCardProps {
  config: BatteryStatusCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const BatteryStatusCard = ({
  config,
  isEditing,
  onEdit,
}: BatteryStatusCardProps) => {
  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <BatteryStatus deviceId={config.deviceId} />
    </BaseCard>
  );
};

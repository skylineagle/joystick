import { TerminalPingControl } from "@/pages/stream-view/controls/terminal-ping-control";
import type { PingControlCardConfig } from "@/types/dashboard-cards";
import { BaseCard } from "./base-card";

interface PingControlCardProps {
  config: PingControlCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const PingControlCard: React.FC<PingControlCardProps> = ({
  config,
  isEditing,
  onEdit,
}) => {
  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <div className="h-full w-full overflow-auto">
        <TerminalPingControl deviceId={config.deviceId} tabActive={true} />
      </div>
    </BaseCard>
  );
};

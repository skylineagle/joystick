import { type CardConfig, CardType } from "@/types/dashboard-cards";
import { StreamViewCard } from "./stream-view-card";
import { BatteryStatusCard } from "./battery-status-card";
import { CellStatusCard } from "./cell-status-card";
import { LocationCard } from "./location-card";
import { IMUStatusCard } from "./imu-status-card";
import { ActionRunnerCard } from "./action-runner-card";
import { ParamValueEditorCard } from "./param-value-editor-card";

interface CardFactoryProps {
  config: CardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const CardFactory = ({
  config,
  isEditing,
  onEdit,
}: CardFactoryProps) => {
  switch (config.type) {
    case CardType.STREAM_VIEW:
      return (
        <StreamViewCard config={config} isEditing={isEditing} onEdit={onEdit} />
      );
    case CardType.BATTERY_STATUS:
      return (
        <BatteryStatusCard
          config={config}
          isEditing={isEditing}
          onEdit={onEdit}
        />
      );
    case CardType.CELL_STATUS:
      return (
        <CellStatusCard config={config} isEditing={isEditing} onEdit={onEdit} />
      );
    case CardType.LOCATION:
      return (
        <LocationCard config={config} isEditing={isEditing} onEdit={onEdit} />
      );
    case CardType.IMU_STATUS:
      return (
        <IMUStatusCard config={config} isEditing={isEditing} onEdit={onEdit} />
      );
    case CardType.ACTION_RUNNER:
      return (
        <ActionRunnerCard
          config={config}
          isEditing={isEditing}
          onEdit={onEdit}
        />
      );
    case CardType.PARAM_VALUE_EDITOR:
      return (
        <ParamValueEditorCard
          config={config}
          isEditing={isEditing}
          onEdit={onEdit}
        />
      );
  }
};

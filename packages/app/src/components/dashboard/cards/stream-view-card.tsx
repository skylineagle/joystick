import { useDevice } from "@/hooks/use-device";
import { MediaFrame } from "@/pages/stream-view/media-frame";
import { WsFrame } from "@/pages/stream-view/ws-frame";
import type { StreamViewCardConfig } from "@/types/dashboard-cards";
import { BaseCard } from "./base-card";
import { pb } from "@/lib/pocketbase";

interface StreamViewCardProps {
  config: StreamViewCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export const StreamViewCard = ({
  config,
  isEditing,
  onEdit,
}: StreamViewCardProps) => {
  const { data: device } = useDevice(config.deviceId);

  if (!device) {
    return (
      <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground italic">
            Device not found
          </p>
        </div>
      </BaseCard>
    );
  }

  const isMediaMtx = device.expand?.device.stream === "mediamtx";
  const overerlayPath = pb.files.getURL(device, device.overlay);

  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <div className="relative w-full h-full">
        {isMediaMtx ? (
          <MediaFrame
            deviceId={device.id}
            deviceName={device.configuration?.name || ""}
            aspectRatio={device.information?.aspectRatio}
            overlayPath={overerlayPath}
          />
        ) : (
          <WsFrame mode="view" />
        )}
      </div>
    </BaseCard>
  );
};

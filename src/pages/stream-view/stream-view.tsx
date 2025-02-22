import { useDevice } from "@/hooks/use-device";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useRoiMode } from "@/hooks/use-roi-mode";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { Controls } from "@/pages/stream-view/controls";
import { Roi } from "@/pages/stream-view/roi/roi";
import { memo } from "react";
import { useParams } from "react-router-dom";
import { Frame as WsFrame } from "./ws-frame";

// Memoize the frame to prevent rerenders when ROI mode changes
const Frame = memo(
  ({
    deviceName,
    isMediaMtx,
    mode,
  }: {
    deviceName: string;
    isMediaMtx: boolean;
    mode: "edit" | "view";
  }) => {
    return isMediaMtx ? (
      <iframe
        src={`${urls.stream}/${deviceName}?controls=false&autoPlay=true`}
        className="size-full"
      />
    ) : (
      <WsFrame mode={mode} />
    );
  }
);

export function StreamView() {
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId ?? "");
  const { roiMode } = useRoiMode();

  if (!device) return <div>No device selected</div>;

  const isMediaMtx = device.expand?.device.stream === "mediamtx";
  const mode = roiMode === "hide" ? "view" : "edit";

  return (
    <div
      className={cn(
        "flex gap-4 md:gap-6 h-full",
        isMobileLandscape ? "flex-row" : "flex-col md:flex-row"
      )}
    >
      <div className="flex-1 min-h-0 relative">
        <Frame deviceName={device.name} isMediaMtx={isMediaMtx} mode={mode} />
        {roiMode !== "hide" && (
          <div className="absolute inset-0">
            <Roi>
              <div className="absolute inset-0" />
            </Roi>
          </div>
        )}
      </div>
      <Controls />
    </div>
  );
}

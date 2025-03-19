import { useDevice } from "@/hooks/use-device";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useRoiMode } from "@/hooks/use-roi-mode";
import { cn } from "@/lib/utils";
import { Controls } from "@/pages/stream-view/controls";
import { Roi } from "@/pages/stream-view/roi/roi";
import { memo } from "react";
import { RoiProvider } from "@/pages/stream-view/roi/roi-provider";
import { useParams } from "react-router-dom";
import { MediaFrame, RoiMediaFrame } from "./media-frame";
import { WsFrame } from "./ws-frame";

// Memoize the frame to prevent rerenders when ROI mode changes
export const Frame = memo(
  ({
    deviceId,
    deviceName,
    isMediaMtx,
    mode,
  }: {
    deviceId: string;
    deviceName: string;
    isMediaMtx: boolean;
    mode: "edit" | "view";
  }) => {
    return isMediaMtx ? (
      mode === "edit" ? (
        <RoiMediaFrame deviceId={deviceId} deviceName={deviceName} />
      ) : (
        <MediaFrame deviceId={deviceId} deviceName={deviceName} />
      )
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
    <RoiProvider deviceId={device.id}>
      <div
        className={cn(
          "flex gap-4 md:gap-6 h-full border-none",
          isMobileLandscape ? "flex-row" : "flex-col md:flex-row"
        )}
      >
        <div className="flex-1 min-h-0 relative border-none">
          <Frame
            deviceId={device.id}
            deviceName={device.configuration?.name || ""}
            isMediaMtx={isMediaMtx}
            mode={mode}
          />

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
    </RoiProvider>
  );
}

import { useDevice } from "@/hooks/use-device";
import { useRoiMode } from "@/hooks/use-roi-mode";
import { Roi } from "@/pages/stream-view/roi/roi";
import { memo } from "react";
import { useParams } from "react-router";
import { MediaFrame, RoiMediaFrame } from "./media-frame";
import { WsFrame } from "./ws-frame";
import { pb } from "@/lib/pocketbase";
import { useIsMediaSupported } from "@/hooks/use-support-media";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";

export const Frame = memo(
  ({
    deviceId,
    deviceName,
    isMediaMtx,
    mode,
    aspectRatio,
    overlayPath,
  }: {
    deviceId: string;
    deviceName: string;
    isMediaMtx: boolean;
    mode: "edit" | "view";
    aspectRatio?: string;
    overlayPath?: string;
  }) => {
    return isMediaMtx ? (
      mode === "edit" ? (
        <RoiMediaFrame
          deviceId={deviceId}
          deviceName={deviceName}
          aspectRatio={aspectRatio}
          overlayPath={overlayPath}
        />
      ) : (
        <MediaFrame
          deviceId={deviceId}
          deviceName={deviceName}
          aspectRatio={aspectRatio}
          overlayPath={overlayPath}
        />
      )
    ) : (
      <WsFrame mode={mode} />
    );
  }
);

export function StreamView() {
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId ?? "");
  const { roiMode } = useRoiMode();
  const isMediaSupported = useIsMediaSupported(deviceId ?? "");
  const isRouteAllowed = useIsRouteAllowed("media");

  if (!isMediaSupported) return <div>Media not supported</div>;
  if (!device) return <div>No device selected</div>;

  const isMediaMtx = device.expand?.device.stream === "mediamtx";
  const mode = roiMode === "hide" ? "view" : "edit";
  const overerlayPath = pb.files.getURL(device, device.overlay);

  if (!isRouteAllowed) {
    return <div>You are not allowed to access this page</div>;
  }
  
  return (
    <>
      <Frame
        deviceId={device.id}
        deviceName={device.configuration?.name || ""}
        isMediaMtx={isMediaMtx}
        mode={mode}
        overlayPath={overerlayPath}
        aspectRatio={device.information?.aspectRatio}
      />

      {roiMode !== "hide" && (
        <div className="absolute inset-0">
          <Roi deviceId={device.id}>
            <div className="absolute inset-0" />
          </Roi>
        </div>
      )}
    </>
  );
}

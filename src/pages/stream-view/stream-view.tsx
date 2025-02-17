import { useDevice } from "@/hooks/use-device";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { Controls } from "@/pages/stream-view/controls";
import { useParams } from "react-router-dom";
import { Frame } from "./frame";

export function StreamView() {
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId ?? "");

  if (!device) return <div>No device selected</div>;

  return (
    <div
      className={cn(
        "flex gap-4 md:gap-6 h-full",
        isMobileLandscape ? "flex-row" : "flex-col md:flex-row"
      )}
    >
      <div className="flex-1 min-h-0">
        {device.expand?.device.stream === "mediamtx" ? (
          <iframe src={`${urls.stream}/${device.name}`} className="size-full" />
        ) : (
          <Frame mode="view" />
        )}
      </div>
      <Controls />
    </div>
  );
}

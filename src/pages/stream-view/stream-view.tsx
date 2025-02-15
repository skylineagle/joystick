import { useDevice } from "@/hooks/use-device";
import { useParams } from "react-router-dom";
import { Frame } from "./frame";

export function StreamView() {
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId ?? "");

  if (!device) return <div>No device selected</div>;

  return device.expand?.device.stream === "mediamtx" ? (
    <iframe
      src={`${import.meta.env.VITE_STREAM_URL}/${device.name}`}
      className="size-full"
    />
  ) : (
    <Frame mode="view" />
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { useDevice } from "@/hooks/use-device";
import { useIsSupported } from "@/hooks/use-is-supported";
import { Healthcheck } from "@/pages/status/healthcheck";
import { Frame } from "@/pages/stream-view/stream-view";
import { useParams } from "react-router-dom";
import { CellularStatus } from "./cellular-status";
import { ServicesTable } from "./services-table";

export function StatusPage() {
  const { device: deviceId } = useParams();
  const { data: device, isLoading: isDeviceLoading } = useDevice(deviceId!);
  const hasGetCpsi = useIsSupported(deviceId!, "get-cpsi");
  const hasServicesStatus = useIsSupported(deviceId!, "get-services-status");
  const hasHealthcheck = useIsSupported(deviceId!, "healthcheck");

  if (isDeviceLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  const isMediaMtx = device?.expand?.device.stream === "mediamtx";

  return (
    <div className="size-full">
      <div className="flex justify-between items-center p-4 pb-0">
        <h1 className="text-2xl font-bold">Device Status</h1>
      </div>

      <div className="p-4 size-full overflow-auto flex flex-col gap-4">
        <div className="size-full p-2">
          {device && (
            <Frame
              deviceName={device.name}
              isMediaMtx={isMediaMtx}
              mode="view"
            />
          )}
        </div>
        <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {hasGetCpsi && <CellularStatus deviceId={deviceId!} />}
          {hasServicesStatus && <ServicesTable deviceId={deviceId!} />}
          {hasHealthcheck && <Healthcheck deviceId={deviceId!} />}
        </div>
      </div>
    </div>
  );
}

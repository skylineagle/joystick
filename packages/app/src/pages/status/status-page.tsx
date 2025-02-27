import { Skeleton } from "@/components/ui/skeleton";
import { useDevice } from "@/hooks/use-device";
import { useIsSupported } from "@/hooks/use-is-supported";
import { Healthcheck } from "@/pages/status/healthcheck";
import { useParams } from "react-router-dom";
import { CellularStatus } from "./cellular-status";
import { ServicesTable } from "./services-table";

export function StatusPage() {
  const { device: deviceId } = useParams();
  const { isLoading: isDeviceLoading } = useDevice(deviceId!);
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

  return (
    <div className="size-full">
      <div className="flex justify-between items-center p-4 pb-0">
        <h1 className="text-2xl font-bold">Device Status</h1>
      </div>

      <div className="p-4 size-full overflow-auto">
        <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {hasGetCpsi && <CellularStatus deviceId={deviceId!} />}
          {hasServicesStatus && <ServicesTable deviceId={deviceId!} />}
          {hasHealthcheck && <Healthcheck deviceId={deviceId!} />}
        </div>
      </div>
    </div>
  );
}

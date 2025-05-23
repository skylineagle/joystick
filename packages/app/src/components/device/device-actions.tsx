import { ConfigurationEditor } from "@/components/configuration/configuration-editor";
import { ClientFileDownload } from "@/components/device/client-file-download";
import { DeleteDevice } from "@/components/device/delete-device";
import { SlotSelector } from "@/components/device/slot-selector";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { DeviceResponse } from "@/types/types";
import { Joystick } from "lucide-react";
import { Link } from "react-router";

interface DeviceActionsProps {
  device: DeviceResponse;
}
export function DeviceActions({ device }: DeviceActionsProps) {
  const isAllowedToControlDevice = useIsPermitted("control-device") ?? false;
  const isAllowedToDeleteDevice = useIsPermitted("delete-device") ?? false;
  const isAllowedToEditDevice = useIsPermitted("edit-device") ?? false;
  const isAllowedToDownloadClientFile =
    useIsPermitted("download-client") ?? false;
  const isAllowedToToggleSlot = useIsPermitted("toggle-slot") ?? false;

  if (!device) return null;

  const hasSlotSelector =
    isAllowedToToggleSlot &&
    device.information?.host &&
    device.information?.secondSlotHost;

  return (
    <div className="flex items-center justify-end gap-1 min-w-0">
      {hasSlotSelector && (
        <>
          <SlotSelector device={device} />
          <Separator orientation="vertical" className="h-6 mx-1" />
        </>
      )}

      <div className="flex items-center gap-1">
        {isAllowedToEditDevice && <ConfigurationEditor device={device} />}
        {isAllowedToControlDevice && (
          <Link to={`/${device.id}`} className="self-center">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Joystick className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {isAllowedToDownloadClientFile && (
          <ClientFileDownload device={device} />
        )}
        {isAllowedToDeleteDevice && <DeleteDevice deviceId={device.id} />}
      </div>
    </div>
  );
}

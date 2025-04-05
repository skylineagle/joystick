import { ConfigurationEditor } from "@/components/configuration/configuration-editor";
import { ClientFileDownload } from "@/components/device/client-file-download";
import { DeleteDevice } from "@/components/device/delete-device";
import { Button } from "@/components/ui/button";
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
  return (
    device && (
      <>
        {isAllowedToEditDevice && <ConfigurationEditor device={device} />}
        {isAllowedToControlDevice && (
          <Link to={`/${device.id}`} className="self-center">
            <Button variant="ghost" size="icon">
              <Joystick className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {isAllowedToDownloadClientFile && (
          <ClientFileDownload device={device} />
        )}
        {isAllowedToDeleteDevice && <DeleteDevice deviceId={device.id} />}
      </>
    )
  );
}

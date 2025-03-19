import { ConfigurationEditor } from "@/components/configuration/configuration-editor";
import { AutomateToggle } from "@/components/device/automate-toggle";
import { AutomationIndicator } from "@/components/device/automation-indicator";
import { DeleteDevice } from "@/components/device/delete-device";
import { DeviceName } from "@/components/device/device-name";
import { ModeSelector } from "@/components/device/mode-selector";
import { StatusIndicator } from "@/components/device/status-indicator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { DeviceResponse } from "@/types/types";
import { Joystick } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";

interface DeviceProps {
  device: DeviceResponse;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export const DeviceRow = memo(
  ({ device, isSelected, onSelect }: DeviceProps) => {
    const isAllowedToControlDevice = useIsPermitted("control-device");
    const isAllowedToDeleteDevice = useIsPermitted("delete-device");
    const isAllowedToEditDevice = useIsPermitted("edit-device");

    if (!device) return null;

    return (
      <TableRow>
        <TableCell className="w-[3%] px-0">
          <div className="pl-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelect?.(device.id, checked as boolean)
              }
              aria-label={`Select ${device.name || device.configuration?.name}`}
            />
          </div>
        </TableCell>
        <TableCell className="w-[12%]">
          <DeviceName
            deviceId={device.id}
            name={device.name}
            configurationName={device.configuration?.name || ""}
          />
        </TableCell>
        <TableCell className="w-[20%]">
          {device && <ModeSelector device={device} />}
        </TableCell>
        <TableCell className="w-[10%]">
          {device.automation && (
            <AutomateToggle deviceId={device.id} isAutomated={device.auto} />
          )}
        </TableCell>
        <TableCell className="w-[10%]">
          <StatusIndicator status={device.status} />
        </TableCell>
        <TableCell className="w-[25%]">
          {device.auto && device.automation && (
            <AutomationIndicator
              deviceId={device.id}
              automation={device.automation}
              status={device.status}
            />
          )}
        </TableCell>
        <TableCell className="w-[10%]">
          <div className="flex gap-2">
            {isAllowedToEditDevice && <ConfigurationEditor device={device} />}
            {isAllowedToControlDevice && (
              <Link to={`/${device.id}`} className="self-center">
                <Button variant="ghost" size="icon">
                  <Joystick className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {isAllowedToDeleteDevice && <DeleteDevice deviceId={device.id} />}
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

DeviceRow.displayName = "DeviceRow";

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
import { useDevice } from "@/hooks/use-device";
import { ExternalLink } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";

interface DeviceProps {
  deviceId: string;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export const DeviceRow = memo(
  ({ deviceId, isSelected, onSelect }: DeviceProps) => {
    const { data: device } = useDevice(deviceId);

    if (!device) return null;

    return (
      <TableRow>
        <TableCell className="w-[5%] px-0">
          <div className="pl-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelect?.(deviceId, checked as boolean)
              }
              aria-label={`Select ${device.name || device.configuration?.name}`}
            />
          </div>
        </TableCell>
        <TableCell className="w-[10%]">
          <DeviceName
            name={device.name}
            configurationName={device.configuration?.name || ""}
          />
        </TableCell>
        <TableCell className="w-[20%]">
          <ModeSelector deviceId={deviceId} />
        </TableCell>
        <TableCell className="w-[10%]">
          {device.automation && (
            <AutomateToggle deviceId={deviceId} isAutomated={device.auto} />
          )}
        </TableCell>
        <TableCell className="w-[10%]">
          <StatusIndicator status={device.status} />
        </TableCell>
        <TableCell className="w-[20%]">
          {device.auto && device.automation && (
            <AutomationIndicator device={device} />
          )}
        </TableCell>
        <TableCell className="w-[15%]">
          <div className="flex gap-2">
            <ConfigurationEditor device={device} />
            <Link target="_blank" to={`/${deviceId}`} className="self-center">
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View device</span>
              </Button>
            </Link>
            <DeleteDevice device={device} />
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

DeviceRow.displayName = "DeviceRow";

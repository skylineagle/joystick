import { ConfigurationEditor } from "@/components/configuration/configuration-editor";
import { AutomationIndicator } from "@/components/device/automation-indicator";
import { DeleteDevice } from "@/components/device/delete-device";
import { DeviceName } from "@/components/device/device-name";
import { ModeSelector } from "@/components/device/mode-selector";
import { StatusIndicator } from "@/components/device/status-indicator";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useDevice } from "@/hooks/use-device";
import { useAuthStore } from "@/lib/auth";
import { memo } from "react";

interface DeviceProps {
  deviceId: string;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export const DeviceRow = memo(
  ({ deviceId, isSelected, onSelect }: DeviceProps) => {
    const { user } = useAuthStore();
    const { data: device } = useDevice(deviceId);
    
    if (!device) return null;

    return (
      <TableRow>
        <TableCell className="w-[5%] px-0">
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
        <TableCell className="w-[10%]">
          <DeviceName
            name={device.name}
            configurationName={device.configuration?.name || ""}
          />
        </TableCell>
        <TableCell className="w-[15%]">
          <ModeSelector
            automation={Boolean(device.automation)}
            deviceId={device.id}
          />
        </TableCell>
        <TableCell className="w-[15%]">
          <StatusIndicator status={device.status} />
        </TableCell>
        <TableCell className="w-[20%]">
          <AutomationIndicator device={device} />
        </TableCell>
        <TableCell className="w-[15%]">
          <div className="flex gap-2">
            <ConfigurationEditor device={device} />
            {user?.level === "manager" ||
              (user?.level === "super" && <DeleteDevice device={device} />)}
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

DeviceRow.displayName = "DeviceRow";

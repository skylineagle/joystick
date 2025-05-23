import { AutomationIndicator } from "@/components/device/automation-indicator";
import { DeviceResponse } from "@/types/types";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DeviceResponse>();

export const createAutomationColumn = () =>
  columnHelper.display({
    id: "automation",
    header: "Automation",
    cell: ({ row }) =>
      row.original.automation &&
      row.original.auto && (
        <AutomationIndicator
          deviceId={row.original.id}
          automation={row.original.automation}
          status={row.original.status ?? "off"}
        />
      ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  });

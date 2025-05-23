import { DeviceActions } from "@/components/device/device-actions";
import { DeviceResponse } from "@/types/types";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DeviceResponse>();

export const createActionsColumn = (): ColumnDef<DeviceResponse, unknown> =>
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const device = row.original;
      return <DeviceActions device={device} />;
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  });

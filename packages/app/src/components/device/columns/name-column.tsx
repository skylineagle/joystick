import { DeviceName } from "@/components/device/device-name";
import { DeviceResponse } from "@/types/types";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DeviceResponse>();

export const createNameColumn = () =>
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <DeviceName
        deviceId={row.original.id}
        name={row.original.name}
        configurationName={row.original.configuration?.name ?? ""}
      />
    ),

    enableColumnFilter: false,
  });

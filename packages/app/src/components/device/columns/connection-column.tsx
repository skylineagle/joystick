import { Badge } from "@/components/ui/badge";
import { DeviceResponse } from "@/types/types";
import { getActiveDeviceConnection } from "@/utils/device";
import { createColumnHelper } from "@tanstack/react-table";
import { Globe, Phone, Network } from "lucide-react";

const columnHelper = createColumnHelper<DeviceResponse>();

export const createConnectionColumn = () =>
  columnHelper.display({
    id: "connection",
    header: "Connection Slot",
    cell: ({ row }) => {
      const device = row.original;

      const {
        host: activeHost,
        port: activePort,
        phone: activePhone,
      } = device.information
        ? getActiveDeviceConnection(device.information)
        : { host: undefined, port: undefined, phone: undefined };

      return (
        <div className="flex flex-col gap-1.5 text-xs w-full">
          {activeHost && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 px-2 py-1 w-fit"
            >
              <Globe className="h-3 w-3" />
              <span
                className="font-mono text-xs truncate max-w-[120px]"
                title={activeHost}
              >
                {activeHost}
              </span>
            </Badge>
          )}

          {activePort && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 px-2 py-1 w-fit"
            >
              <Network className="h-3 w-3" />
              <span
                className="font-mono text-xs truncate max-w-[120px]"
                title={`Port: ${activePort}`}
              >
                {activePort}
              </span>
            </Badge>
          )}

          {activePhone && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 px-2 py-1 w-fit"
            >
              <Phone className="h-3 w-3" />
              <span
                className="font-mono text-xs truncate max-w-[120px]"
                title={activePhone}
              >
                {activePhone}
              </span>
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  });

import { StatusIndicator } from "@/components/device/status-indicator";
import { defineMeta, filterFn } from "@/lib/filters";
import { DeviceResponse } from "@/types/types";
import { createColumnHelper } from "@tanstack/react-table";
import { Power } from "lucide-react";

const columnHelper = createColumnHelper<DeviceResponse>();

export const createStatusColumn = () =>
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusIndicator status={row.original.status ?? "off"} />
    ),
    filterFn: filterFn("option"),
    meta: defineMeta((row) => row.status, {
      displayName: "Status",
      type: "option",
      icon: Power,
      options: [
        { label: "Live", value: "on" },
        { label: "Waiting", value: "waiting" },
        { label: "Offline", value: "off" },
      ],
    }),
  });

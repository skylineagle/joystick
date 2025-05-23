import { AutomateToggle } from "@/components/device/automate-toggle";
import { defineMeta, filterFn } from "@/lib/filters";
import { DeviceResponse } from "@/types/types";
import { createColumnHelper } from "@tanstack/react-table";
import { Clock } from "lucide-react";

const columnHelper = createColumnHelper<DeviceResponse>();

export const createAutoColumn = () =>
  columnHelper.accessor("auto", {
    id: "auto",
    header: "Auto",
    cell: ({ row }) => (
      <AutomateToggle
        deviceId={row.original.id}
        isAutomated={row.original.auto ?? false}
      />
    ),
    filterFn: filterFn("option"),
    meta: defineMeta((row) => row.auto, {
      displayName: "Auto",
      type: "option",
      icon: Clock,
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    }),
  });

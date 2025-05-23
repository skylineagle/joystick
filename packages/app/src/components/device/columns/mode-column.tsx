import { modeConfig } from "@/components/device/consts";
import { ModeSelector } from "@/components/device/mode-selector";
import { defineMeta, filterFn } from "@/lib/filters";
import { DeviceResponse } from "@/types/types";
import { createColumnHelper } from "@tanstack/react-table";
import { Settings } from "lucide-react";

const columnHelper = createColumnHelper<DeviceResponse>();

export const createModeColumn = (availableModes: string[] | undefined) =>
  columnHelper.accessor("mode", {
    id: "mode",
    header: "Mode",
    cell: ({ row }) => <ModeSelector device={row.original} />,
    filterFn: filterFn("option"),
    meta: defineMeta((row) => row.mode, {
      displayName: "Mode",
      type: "option",
      icon: Settings,
      options: availableModes?.map((m) => ({
        label: modeConfig?.[m as keyof typeof modeConfig]?.label ?? m,
        value: m,
      })),
    }),
  });

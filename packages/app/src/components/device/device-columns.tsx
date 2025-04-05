import { AutomateToggle } from "@/components/device/automate-toggle";
import { AutomationIndicator } from "@/components/device/automation-indicator";
import { DeviceName } from "@/components/device/device-name";
import { ModeSelector } from "@/components/device/mode-selector";
import { StatusIndicator } from "@/components/device/status-indicator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { defineMeta, filterFn } from "@/lib/filters";
import { DeviceResponse } from "@/types/types";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Clock,
  Download,
  MoreHorizontal,
  Pencil,
  Play,
  Power,
  Settings,
  Tag,
  Trash,
  Zap,
} from "lucide-react";

interface DeviceColumnsProps {
  onRowSelect: (device: DeviceResponse) => void;
  allowedToControlDevice: boolean;
  allowedToDeleteDevice: boolean;
  allowedToEditDevice: boolean;
  allowedToDownloadClientFile: boolean;
}

const columnHelper = createColumnHelper<DeviceResponse>();

export function createDeviceColumns({
  onRowSelect,
  allowedToControlDevice,
  allowedToDeleteDevice,
  allowedToEditDevice,
  allowedToDownloadClientFile,
}: DeviceColumnsProps) {
  return [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <DeviceName
          deviceId={row.original.id}
          name={row.original.name}
          configurationName={row.original.configuration?.name ?? ""}
        />
      ),
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.name, {
        displayName: "Name",
        type: "text",
        icon: Tag,
      }),
    }),
    columnHelper.accessor("mode", {
      header: "Mode",
      cell: ({ row }) => <ModeSelector device={row.original} />,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.mode, {
        displayName: "Mode",
        type: "option",
        icon: Settings,
        options: [
          { label: "Manual", value: "manual" },
          { label: "Auto", value: "auto" },
        ],
      }),
    }),
    columnHelper.accessor("auto", {
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
    }),
    columnHelper.accessor("status", {
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
          { label: "Online", value: "online" },
          { label: "Offline", value: "offline" },
        ],
      }),
    }),
    columnHelper.accessor("automation", {
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
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.automation, {
        displayName: "Automation",
        type: "option",
        icon: Zap,
        options: [
          { label: "Enabled", value: "true" },
          { label: "Disabled", value: "false" },
        ],
      }),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const device = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allowedToEditDevice && (
                <DropdownMenuItem
                  onClick={() => onRowSelect(device)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {allowedToControlDevice && (
                <DropdownMenuItem
                  onClick={() => onRowSelect(device)}
                  className="cursor-pointer"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Control
                </DropdownMenuItem>
              )}
              {allowedToDownloadClientFile && (
                <DropdownMenuItem
                  onClick={() => onRowSelect(device)}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              )}
              {allowedToDeleteDevice && (
                <DropdownMenuItem
                  onClick={() => onRowSelect(device)}
                  className="cursor-pointer"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    }),
  ];
}

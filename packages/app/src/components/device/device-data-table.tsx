import { DataTableFilter } from "@/components/data-table-filter";
import { AutomateToggle } from "@/components/device/automate-toggle";
import { AutomationIndicator } from "@/components/device/automation-indicator";
import { DeviceActions } from "@/components/device/device-actions";
import { DeviceName } from "@/components/device/device-name";
import { ModeSelector } from "@/components/device/mode-selector";
import { StatusIndicator } from "@/components/device/status-indicator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { defineMeta, filterFn } from "@/lib/filters";
import { DeviceResponse } from "@/types/types";
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Clock, Power, Search, Settings } from "lucide-react";
import { parseAsJson, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useDeviceStore } from "@/store/device-store";
import { useAvailableModes } from "@/hooks/use-available-modes";
import { modeConfig } from "@/components/device/consts";
import { AddDeviceModal } from "@/components/device/add-device-modal";

interface DeviceDataTableProps {
  data: DeviceResponse[];
}

const dataTableFilterQuerySchema = z
  .object({
    id: z.string(),
    value: z.object({
      operator: z.string(),
      values: z.any(),
    }),
  })
  .array()
  .min(0);

type DataTableFilterQuerySchema = z.infer<typeof dataTableFilterQuerySchema>;

function initializeFiltersFromQuery<TData, TValue>(
  filters: DataTableFilterQuerySchema,
  columns: ColumnDef<TData, TValue>[]
) {
  return filters && filters.length > 0
    ? filters.map((f) => {
        console.log(columns);

        const columnMeta = columns.find((c) => c.id === f.id)!.meta!;

        const values =
          columnMeta.type === "date"
            ? f.value.values.map((v: string) => new Date(v))
            : f.value.values;

        return {
          ...f,
          value: {
            operator: f.value.operator,
            values,
            columnMeta,
          },
        };
      })
    : [];
}

const columnHelper = createColumnHelper<DeviceResponse>();

// Define column widths consistently
const columnWidths = {
  select: "w-[3%]",
  name: "w-[15%]",
  mode: "w-[15%]",
  auto: "w-[10%]",
  status: "w-[10%]",
  automation: "w-[35%]",
  actions: "w-[12%]",
};

export function DeviceDataTable({ data }: DeviceDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [queryFilters, setQueryFilters] = useQueryState(
    "filter",
    parseAsJson(dataTableFilterQuerySchema.parse).withDefault([])
  );
  const { data: availableModes } = useAvailableModes(
    Array.from(new Set(data.map((d) => d.device)))
  );
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
      }),
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
      }),
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
      }),
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
      }),
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
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const device = row.original;

          return <DeviceActions device={device} />;
        },
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
      }),
    ],
    [availableModes]
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    initializeFiltersFromQuery(
      queryFilters,
      columns as ColumnDef<DeviceResponse>[]
    )
  );
  const { searchQuery, setSearchQuery } = useDeviceStore();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: data as DeviceResponse[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchQuery,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    setQueryFilters(
      columnFilters.map((f) => ({
        id: f.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: { ...(f.value as any), columnMeta: undefined },
      }))
    );
  }, [columnFilters, setQueryFilters]);

  return (
    <div className="size-full">
      <div className="flex flex-row items-center gap-4 pb-4">
        <div className="flex-1 relative size-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DataTableFilter table={table} />
        <AddDeviceModal />
      </div>
      <div className="rounded-md border">
        <div className="relative">
          <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
            <Table className="rounded-t-md">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => {
                      const widthClass =
                        columnWidths[header.id as keyof typeof columnWidths] ||
                        "";
                      return (
                        <TableHead key={header.id} className={widthClass}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
            </Table>
          </div>
          <div className="overflow-auto max-h-[calc(100vh-27rem)] scrollbar-thin scrollbar-thumb-secondary scrollbar-track-secondary/20">
            <Table className="rounded-b-md">
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const widthClass =
                          columnWidths[
                            cell.column.id as keyof typeof columnWidths
                          ] || "";

                        return (
                          <TableCell key={cell.id} className={widthClass}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span>Device is online and responding</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full border-amber-500 bg-amber-500/10 bg-amber-700 dark:bg-amber-300 shadow hover:bg-amber-500/20" />
          <span>Device is offline or not responding</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
          <span>Waiting for device response</span>
        </div>
      </div>
    </div>
  );
}

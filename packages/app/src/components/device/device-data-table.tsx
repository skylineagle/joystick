import { DataTableFilter } from "@/components/data-table-filter";
import { AddDeviceModal } from "@/components/device/add-device-modal";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAvailableModes } from "@/hooks/use-available-modes";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useDeviceStore } from "@/store/device-store";
import { DeviceResponse } from "@/types/types";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { parseAsJson, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { createActionsColumn } from "./columns/actions-column";
import { createAutoColumn } from "./columns/auto-column";
import { createAutomationColumn } from "./columns/automation-column";
import { createConnectionColumn } from "./columns/connection-column";
import { createModeColumn } from "./columns/mode-column";
import { createNameColumn } from "./columns/name-column";
import { createSelectColumn } from "./columns/select-column";
import { createStatusColumn } from "./columns/status-column";

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

const globalFilterFn = (
  row: Row<DeviceResponse>,
  _columnId: string,
  value: string
) => {
  const device = row.original;
  const searchValue = value?.toLowerCase();

  const searchableFields = [
    device.name,
    device.mode,
    device.status,
    device.configuration?.name,
    device.expand?.device?.name,
    device.description,
    device.client,
  ];

  return searchableFields.some((field) =>
    field?.toString()?.toLowerCase().includes(searchValue)
  );
};

// Define column widths consistently
const columnWidths = {
  select: "w-[3%]",
  name: "w-[10%]",
  mode: "w-[15%]",
  auto: "w-[6%]",
  status: "w-[10%]",
  automation: "w-[24%]",
  connection: "w-[15%]",
  actions: "w-[17%]",
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
  const isAllowedToViewConnection = useIsPermitted("toggle-slot");
  const columns = useMemo(
    () => [
      createSelectColumn(),
      createNameColumn(),
      createModeColumn(availableModes),
      createAutoColumn(),
      createStatusColumn(),
      createAutomationColumn(),
      ...(isAllowedToViewConnection ? [createConnectionColumn()] : []),
      createActionsColumn(),
    ],
    [availableModes, isAllowedToViewConnection]
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
    globalFilterFn,
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
    <div className="flex flex-col size-full">
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
      <div className="rounded-md border flex-1">
        <div className="relative">
          <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
            <Table className="rounded-t-md size-full">
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
                      data-testid={`device-row-${row.original.id}`}
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

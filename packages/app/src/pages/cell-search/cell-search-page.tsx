import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { cn } from "@/lib/utils";
import { CellSearchLoadingAnimation } from "@/pages/cell-search/cell-search-loading";
import { CellTowerData } from "@/pages/cell-search/types";
import {
  getSignalStrength,
  getTechnologyBadgeVariant,
  parseCellSearchResponse,
} from "@/pages/cell-search/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpDown,
  Download,
  Radio,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";

export function CellSearchPage() {
  const { device: deviceId } = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { isSupported: isCellSearchSupported } = useIsSupported(
    deviceId!,
    "cell-search"
  );
  const isCellSearchPermitted = useIsPermitted("cell-search");
  const isRouteAllowed = useIsRouteAllowed("cell-search");

  const {
    data: cellData = [],
    refetch,
    isFetching,
    isLoading: isQueryLoading,
  } = useQuery({
    queryKey: ["cell-search", deviceId],
    queryFn: async () => {
      const result = await runAction({
        action: "cell-search",
        params: {},
        deviceId: deviceId!,
      });

      return parseCellSearchResponse(result ?? "[]");
    },
    enabled: !!deviceId,
  });

  const isLoading = isFetching || isQueryLoading;

  const columns: ColumnDef<CellTowerData>[] = useMemo(
    () => [
      {
        accessorKey: "operator",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent hover:text-accent"
          >
            Operator
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("operator")}</div>
        ),
      },
      {
        accessorKey: "tech",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent hover:text-accent"
          >
            Technology
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const tech = row.getValue("tech") as string;
          return (
            <Badge variant={getTechnologyBadgeVariant(tech)}>{tech}</Badge>
          );
        },
      },
      {
        accessorKey: "band",
        header: "Band",
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.getValue("band")}</div>
        ),
      },
      {
        accessorKey: "cellIdHex",
        header: "Cell ID",
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.getValue("cellIdHex")}</div>
        ),
      },
      {
        accessorKey: "pci",
        header: "PCI",
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.getValue("pci")}</div>
        ),
      },
      {
        accessorKey: "rsrp",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent hover:text-accent"
          >
            RSRP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const rsrp = row.getValue("rsrp") as number;
          const signalInfo = getSignalStrength(rsrp);
          return (
            <div className="flex items-center gap-2">
              <div className={cn("size-2 rounded-full", signalInfo.color)} />
              <span className={cn("font-mono text-sm", signalInfo.textColor)}>
                {rsrp} dBm
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "rsrq",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent hover:text-accent"
          >
            RSRQ
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.getValue("rsrq")} dB</span>
        ),
      },
      {
        accessorKey: "frequency",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent hover:text-accent"
          >
            Frequency
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.getValue("frequency")} MHz
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: cellData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const handleExportCSV = () => {
    if (!cellData || cellData.length === 0) return;

    const headers = [
      "Operator",
      "Operator ID",
      "Technology",
      "ARFCN",
      "Band",
      "Frequency (MHz)",
      "PCI",
      "TAC",
      "Cell ID (Hex)",
      "Cell ID (Dec)",
      "RSRP (dBm)",
      "RSRQ (dB)",
    ];

    const csvContent = [
      headers.join(","),
      ...cellData.map((cell) =>
        [
          cell.operator,
          cell.operatorId,
          cell.tech,
          cell.arfcn,
          cell.band,
          cell.frequency,
          cell.pci,
          cell.tac,
          cell.cellIdHex,
          cell.cellIdDec,
          cell.rsrp,
          cell.rsrq,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cell-search-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isRouteAllowed) {
    return <div>You are not allowed to access this page</div>;
  }

  if (!isCellSearchSupported) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Cell Search Not Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This device does not support cell search functionality.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCellSearchPermitted) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to use cell search functionality.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="size-full p-2 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 space-y-4 p-4 flex justify-between"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <Radio className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">What The Cell</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="link" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex items-center justify-center"
          >
            <CellSearchLoadingAnimation />
          </motion.div>
        )}

        {cellData.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full flex flex-col gap-4"
          >
            {/* Table */}
            <Card className="flex-1 flex flex-col shadow-xl border-2 min-h-0 overflow-hidden">
              <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="font-semibold"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className="hover:bg-muted/50"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                No results found.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

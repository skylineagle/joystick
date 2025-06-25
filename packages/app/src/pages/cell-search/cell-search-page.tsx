import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";

export function CellSearchPage() {
  const { device: deviceId } = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

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
    enabled: false,
  });

  const isLoading = isFetching || isQueryLoading;

  const handleStartSearch = () => {
    setShowConfigDialog(true);
  };

  const handleConfirmSearch = async () => {
    setShowConfigDialog(false);
    setHasSearched(true);
    await refetch();
  };

  const handleRefresh = () => {
    refetch();
  };

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
        accessorKey: "pci",
        header: "PCI",
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.getValue("pci")}</div>
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

    const escapeCSV = (value: unknown) => {
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(","),
      ...cellData.map((cell) =>
        [
          escapeCSV(cell.operator),
          escapeCSV(cell.operatorId),
          escapeCSV(cell.tech),
          cell.arfcn,
          escapeCSV(cell.band),
          cell.frequency,
          cell.pci,
          cell.tac,
          escapeCSV(cell.cellIdHex),
          escapeCSV(cell.cellIdDec),
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
        <div className="flex items-center gap-2">
          <Radio className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">What The Cell</h1>
        </div>
        {hasSearched && (
          <div className="flex items-center gap-2">
            <Button variant="link" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}
      </motion.div>

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

        {!hasSearched && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="p-8 text-center">
              <div className="relative">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wifi className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Cellular Network Scanner</h2>
                <p className="text-muted-foreground max-w-md">
                  Discover and analyze nearby cell towers, signal strength, and
                  network information.
                </p>
              </div>
              <Button onClick={handleStartSearch} size="lg" className="px-8">
                <Search className="h-5 w-5 mr-2" />
                Start Cell Search
              </Button>
            </div>
          </motion.div>
        )}

        {cellData.length > 0 && !isLoading && hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full flex flex-col gap-4"
          >
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

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Cell Search Configuration
            </DialogTitle>
            <DialogDescription>
              Configure and start cellular network scanning
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Connection Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    The device may temporarily disconnect during the cell search
                    process. This is normal behavior as the device scans for
                    nearby cellular networks.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Scan Information</h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>• Searches for all available cellular networks</p>
                <p>• Analyzes signal strength and quality metrics</p>
                <p>• Collects network operator and technology data</p>
                <p>• Process typically takes 30-60 seconds</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfigDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSearch}>
              <Search className="h-4 w-4 mr-2" />
              Start Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

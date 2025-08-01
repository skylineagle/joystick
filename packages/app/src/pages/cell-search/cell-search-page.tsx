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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TechnologyBadge, SignalStrengthDisplay } from "@/components/ui/cell";
import { useCellScan } from "@/hooks/use-cell-scan";
import { getSignalQuality } from "@/utils/cell";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import { cn } from "@/lib/utils";
import { pb } from "@/lib/pocketbase";
import { toast } from "@/utils/toast";
import { CellSearchLoadingAnimation } from "@/pages/cell-search/cell-search-loading";
import { CellTowerData } from "@/pages/cell-search/types";
import { parseCellSearchResponse } from "@/pages/cell-search/utils";
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
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowUpDown,
  Clock,
  Download,
  Edit3,
  Radio,
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
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showManualInputDialog, setShowManualInputDialog] = useState(false);
  const [manualInputText, setManualInputText] = useState("");
  const [manualInputError, setManualInputError] = useState("");

  const { isSupported: isCellSearchSupported } = useIsSupported(
    deviceId!,
    "run-scan"
  );
  const isCellSearchPermitted = useIsPermitted("cell-search");

  const {
    scanData = [],
    startScan,
    isScanning,
    scanTimestamp,
    refreshScanData,
  } = useCellScan(deviceId!);

  const handleStartScan = () => {
    setShowScanDialog(true);
  };

  const handleConfirmScan = async () => {
    setShowScanDialog(false);
    startScan();
  };

  const handleManualInput = () => {
    setShowManualInputDialog(true);
    setManualInputText("");
    setManualInputError("");
  };

  const handleConfirmManualInput = async () => {
    if (!manualInputText.trim()) {
      setManualInputError("Please enter scan data");
      return;
    }

    try {
      let parsedData: CellTowerData[];

      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(manualInputText.trim());
        if (Array.isArray(jsonData)) {
          const isValidCellData = jsonData.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "operator" in item &&
              "tech" in item &&
              "rsrp" in item
          );
          if (!isValidCellData) {
            throw new Error("JSON array must contain valid cell tower objects");
          }
          parsedData = jsonData;
        } else {
          throw new Error("JSON must be an array");
        }
      } catch {
        // If JSON parsing fails, try parsing as scan response format
        parsedData = parseCellSearchResponse(manualInputText.trim());
      }

      if (parsedData.length === 0) {
        setManualInputError("No valid cell tower data found in the input");
        return;
      }

      // Update device with manual scan results
      await updateDeviceWithManualScanResults(parsedData);

      setShowManualInputDialog(false);
      setManualInputText("");
      setManualInputError("");

      toast.success({
        message: `Manual scan data applied successfully. Found ${parsedData.length} cell towers.`,
      });
    } catch (error) {
      setManualInputError(
        error instanceof Error ? error.message : "Failed to parse scan data"
      );
    }
  };

  const updateDeviceWithManualScanResults = async (
    cellData: CellTowerData[]
  ) => {
    if (!deviceId) {
      throw new Error("Device ID not found");
    }

    try {
      // Get current device data
      const device = await pb.collection("devices").getOne(deviceId);

      const updatedInformation = {
        ...(device.information || {}),
        scan: {
          data: cellData,
          timestamp: new Date().toISOString(),
        },
      };

      // Update device information via PocketBase
      await pb.collection("devices").update(deviceId, {
        information: updatedInformation,
      });

      // Refresh the data
      refreshScanData();
    } catch (error) {
      console.error("Failed to update device with manual scan results:", error);
      throw new Error("Failed to save manual scan results to device");
    }
  };

  // Check if we have any 3G results to determine if RSSI column should be visible
  const has3GResults = useMemo(() => {
    return (
      scanData?.some((cell) => {
        return (
          cell.tech === "3G" || cell.tech === "WCDMA" || cell.tech === "UMTS"
        );
      }) ?? false
    );
  }, [scanData]);

  const columns: ColumnDef<CellTowerData>[] = useMemo(() => {
    const baseColumns: ColumnDef<CellTowerData>[] = [
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
          return <TechnologyBadge technology={tech} size="sm" />;
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
        accessorKey: "cellIdDec",
        header: "Cell ID",
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.getValue("cellIdDec")}</div>
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
          const tech = row.getValue("tech") as string;
          const rowData = row.original as CellTowerData;
          const is3G = tech === "3G" || tech === "WCDMA" || tech === "UMTS";

          // For 3G networks with RSSI, show "-" in RSRP column
          if (is3G && rowData.rssi !== undefined) {
            return <div className="text-center text-muted-foreground">-</div>;
          }

          return (
            <SignalStrengthDisplay
              rsrp={rsrp}
              technology={tech}
              signalType="rsrp"
              showValue
              showQuality
              size="sm"
            />
          );
        },
      },
    ];

    // Add RSSI column only if we have 3G results
    if (has3GResults) {
      baseColumns.push({
        accessorKey: "rssi",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent hover:text-accent"
          >
            RSSI
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const tech = row.getValue("tech") as string;
          const rowData = row.original as CellTowerData;
          const is3G = tech === "3G" || tech === "WCDMA" || tech === "UMTS";

          // Only show RSSI for 3G networks
          if (!is3G || rowData.rssi === undefined) {
            return <div className="text-center text-muted-foreground">-</div>;
          }

          return (
            <SignalStrengthDisplay
              rsrp={rowData.rssi}
              technology={tech}
              signalType="rssi"
              showValue
              showQuality
              size="sm"
            />
          );
        },
      });
    }

    // Add remaining columns
    baseColumns.push(
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
        cell: ({ row }) => {
          const rsrq = row.getValue("rsrq") as number;
          const tech = row.getValue("tech") as string;
          const rowData = row.original as CellTowerData;
          const is3G = tech === "3G" || tech === "WCDMA" || tech === "UMTS";

          // For 3G networks with RSSI, show "-" in RSRQ column
          if (is3G && rowData.rssi !== undefined) {
            return <div className="text-center text-muted-foreground">-</div>;
          }

          const quality = getSignalQuality(rsrq, "rsrq", tech);

          return (
            <div className="text-right">
              <div
                className={cn("font-mono text-sm font-medium", quality.color)}
              >
                {rsrq} dB
              </div>
              <div className={cn("text-xs", quality.color)}>
                {quality.label}
              </div>
            </div>
          );
        },
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
      }
    );

    return baseColumns;
  }, [has3GResults]);

  const table = useReactTable({
    data: scanData ?? [],
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
    if (scanData.length === 0) return;

    const headers = [
      "Operator",
      "Technology",
      "Band",
      "Cell ID (Hex)",
      "Cell ID (Dec)",
      "RSRP (dBm)",
      ...(has3GResults ? ["RSSI (dBm)"] : []),
      "RSRQ (dB)",
      "Frequency (MHz)",
      "PCI",
      "TAC",
      "ARFCN",
    ];

    const escapeCSV = (value: unknown) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(","),
      ...scanData.map((row) =>
        [
          escapeCSV(row.operator),
          escapeCSV(row.tech),
          escapeCSV(row.band),
          escapeCSV(row.cellIdHex),
          escapeCSV(row.cellIdDec),
          escapeCSV(row.rsrp),
          ...(has3GResults ? [escapeCSV(row.rssi ?? "-")] : []),
          escapeCSV(row.rsrq),
          escapeCSV(row.frequency),
          escapeCSV(row.pci),
          escapeCSV(row.tac),
          escapeCSV(row.arfcn),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cell-search-${deviceId}-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isCellSearchSupported) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Feature Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Cell search functionality is not supported on this device. The
              device must support both "run-scan" and "get-scan" actions.
            </p>
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

        <div className="flex items-center gap-2">
          {scanData.length > 0 && (
            <Button variant="link" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualInput}
            disabled={isScanning}
          >
            <Edit3 className="size-4" />
          </Button>

          {scanData && (
            <Button onClick={handleStartScan} disabled={isScanning}>
              {isScanning ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                </motion.div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {scanData?.length > 0 ? "Rescan" : "Start Scan"}
            </Button>
          )}
        </div>
      </motion.div>

      {scanTimestamp && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-1">
          <Clock className="h-4 w-4" />
          <span>
            Last scan:{" "}
            {formatDistanceToNow(new Date(scanTimestamp), {
              addSuffix: true,
            })}
          </span>
        </div>
      )}

      <div className="flex-1">
        {isScanning && !scanData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex items-center justify-center"
          >
            <CellSearchLoadingAnimation />
          </motion.div>
        )}

        {scanData.length === 0 && !isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="flex flex-col justify-center items-center p-8 text-center gap-4">
              <div className="relative">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wifi className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">No Scan Data Available</h2>
                <p className="text-muted-foreground max-w-md">
                  Start your first cellular network scan to discover nearby cell
                  towers, signal strength, and network information.
                </p>
              </div>
              <Button onClick={handleStartScan} size="lg" className="px-8">
                <Search className="h-5 w-5 mr-2" />
                Start Cell Search
              </Button>
            </div>
          </motion.div>
        )}

        {scanData.length > 0 && (
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
                                No cell towers found in the last scan.
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

      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {scanData ? "Start New Scan" : "Start Cell Search"}
            </DialogTitle>
            <DialogDescription>
              {scanData
                ? "This will start a new cellular network scan and replace the existing scan data. The process may take a few minutes to complete and device may be unavailable during this time. "
                : "This will start scanning for nearby cellular networks. The process may take a few minutes to complete and device may be unavailable during this time."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowScanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmScan}>
              <Search className="h-4 w-4 mr-2" />
              Start Scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showManualInputDialog}
        onOpenChange={setShowManualInputDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manual Scan Data Input</DialogTitle>
            <DialogDescription>
              Enter scan data manually. You can paste either raw scan response
              format or pre-parsed JSON array. The data will replace any
              existing scan results.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-hidden">
            <div className="space-y-2 p-2">
              <Label htmlFor="manual-input">Scan Data</Label>
              <Textarea
                id="manual-input"
                placeholder={`Raw format example:
+QOPS: "T-Mobile","310","260"
1,LTE,1950,1,12345,A1B2C3,85,12
2,LTE,2100,2,12346,A1B2C4,90,10

Or JSON format example:
[{"id":"1","operator":"T-Mobile","tech":"LTE","band":"B1","frequency":1950,"rsrp":-85,"rsrq":-12,"cellIdHex":"A1B2C3","cellIdDec":"10597571","pci":1,"tac":"12345","arfcn":1950,"operatorId":"260"}]`}
                value={manualInputText}
                onChange={(e) => {
                  setManualInputText(e.target.value);
                  if (manualInputError) setManualInputError("");
                }}
                className="min-h-[300px] font-mono text-sm resize-none"
              />
            </div>

            {manualInputError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-900">
                {manualInputError}
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>
                  <strong>Raw scan response:</strong> Lines starting with +QOPS:
                  followed by comma-separated cell data
                </li>
                <li>
                  <strong>JSON array:</strong> Pre-parsed array of cell tower
                  objects with required fields
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowManualInputDialog(false);
                setManualInputText("");
                setManualInputError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmManualInput}
              disabled={!manualInputText.trim()}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Apply Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

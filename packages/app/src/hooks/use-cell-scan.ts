import { useDevice } from "@/hooks/use-device";
import { runAction } from "@/lib/joystick-api";
import { pb } from "@/lib/pocketbase";
import { CellTowerData } from "@/pages/cell-search/types";
import { parseCellSearchResponse } from "@/pages/cell-search/utils";
import { DeviceResponse } from "@/types/types";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useCellScan(deviceId: string) {
  const queryClient = useQueryClient();
  const { data: device } = useDevice(deviceId);
  const [scanData, setScanData] = useState<CellTowerData[]>([]);
  const availableScanData = device?.information?.scan;

  // Subscribe to real-time updates
  useEffect(() => {
    const initialScanData = async () => {
      try {
        const result = await pb
          .collection("devices")
          .getFirstListItem<DeviceResponse>(`id = "${deviceId}"`, {
            fields: "information",
          });
        setScanData(result.information?.scan?.data ?? []);
      } catch (error) {
        console.error("Failed to fetch initial scan data:", error);
        setScanData([]);
      }
    };

    pb.collection("devices").subscribe<DeviceResponse>(deviceId, (event) => {
      console.log(event);

      if (event.action === "update") {
        setScanData(event.record.information?.scan?.data ?? []);
      }
    });

    initialScanData().catch(console.error);
    return () => {
      try {
        pb.collection("devices")?.unsubscribe(deviceId);
      } catch {
        // Do nothing
      }
    };
  }, [deviceId]);

  const {
    mutate: runScanMutation,
    isPending: isRunScanPending,
    isError: isRunScanError,
  } = useMutation({
    mutationFn: async () => {
      await runAction({
        action: "run-scan",
        params: {},
        deviceId,
      });
    },
    onSuccess: () => {
      toast.success({
        message:
          "Scan started successfully. Results will be available shortly.",
      });

      queryClient.invalidateQueries({ queryKey: ["scan", deviceId] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error ? error.message : "Failed to start scan",
      });
    },
  });

  useQuery({
    queryKey: ["scan", deviceId],
    queryFn: async () => {
      const result = await runAction({
        action: "get-scan",
        params: {},
        deviceId,
      });

      const data = parseCellSearchResponse(result ?? "[]");

      updateDeviceWithScanResults(data);
      toast.success({
        message: `Scan completed successfully. Found ${data.length} cell towers.`,
      });

      return {
        data,
        timestamp: new Date().toISOString(),
      };
    },
    enabled: !!deviceId,
    refetchInterval: 3000,
  });

  const updateDeviceWithScanResults = async (cellData: CellTowerData[]) => {
    if (!device?.id) {
      toast.error({
        message: "Device not found",
      });
      return;
    }

    try {
      const updatedInformation = {
        ...device?.information,
        scan: {
          data: cellData,
          timestamp: new Date().toISOString(),
        },
      };

      // Update device information via PocketBase
      await pb.collection("devices").update(device.id, {
        information: updatedInformation,
      });

      // Invalidate device query to refresh UI
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
    } catch (error) {
      console.error("Failed to update device with scan results:", error);
      toast.error({
        message: "Failed to save scan results to device",
      });
    }
  };

  const startScan = () => {
    runScanMutation();
  };

  const refreshScanData = () => {
    queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
  };

  return {
    scanData,
    scanTimestamp: availableScanData?.timestamp ?? "",
    startScan,
    refreshScanData,
    isScanning: isRunScanPending,
    scanError: isRunScanError,
  };
}

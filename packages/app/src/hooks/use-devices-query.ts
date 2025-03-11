import { GetDevicesOptions, getDevices } from "@/lib/device";
import { pb } from "@/lib/pocketbase";
import { useDeviceStore } from "@/store/device-store";
import { DeviceResponse } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export function useDevicesQuery(options?: GetDevicesOptions) {
  const {
    devices,
    updateDevice,
    deleteDevice,
    addDevice,
    setDevices,
    searchQuery,
    sortState,
    isReversed,
  } = useDeviceStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const initialDevices = async () => {
      const devices = await getDevices(options || {});
      setDevices(devices);
    };

    initialDevices();

    pb.collection("devices").subscribe<DeviceResponse>("*", (e) => {
      if (e.action === "create") {
        const device = e.record;
        addDevice(device);
      } else if (e.action === "delete") {
        const device = e.record;
        deleteDevice(device.id);
      } else if (e.action === "update") {
        const device = e.record;
        updateDevice(device);
        queryClient.invalidateQueries({ queryKey: ["device", device?.id] });
      }
    });

    return () => {
      pb.collection("devices").unsubscribe("*");
    };
  }, [addDevice, deleteDevice, options, queryClient, setDevices, updateDevice]);

  const sortedAndFilteredDevices = useMemo(() => {
    let result = devices;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result?.filter((device) => {
        const matches =
          device.name?.toLowerCase().includes(query) ||
          device.configuration?.name.toLowerCase().includes(query);
        return isReversed ? !matches : matches;
      });
    }

    // Apply sorting
    if (result && sortState.direction) {
      return [...result].sort((a, b) => {
        let aValue: string | undefined;
        let bValue: string | undefined;

        switch (sortState.column) {
          case "name":
            aValue = a.name || a.configuration?.name || a.mode;
            bValue = b.name || b.configuration?.name || b.mode;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "automation":
            aValue = a.automation
              ? `${a.automation.off.minutes}:${a.automation.off.minutes}`
              : "";
            bValue = b.automation
              ? `${b.automation.off.minutes}:${b.automation.off.minutes}`
              : "";
            break;
        }

        if (!aValue) return sortState.direction === "asc" ? -1 : 1;
        if (!bValue) return sortState.direction === "asc" ? 1 : -1;

        const comparison = aValue.localeCompare(bValue);
        return sortState.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [devices, searchQuery, sortState.direction, sortState.column, isReversed]);

  return {
    devices: sortedAndFilteredDevices,
  };
}

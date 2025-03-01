import { GetDevicesOptions, getDevices } from "@/lib/device";
import { useDeviceStore } from "@/store/device-store";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useDevicesQuery(options?: GetDevicesOptions) {
  const { searchQuery, sortState, isReversed } = useDeviceStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["devices", options?.modes, options?.search],
    queryFn: async () => {
      const devices = await getDevices(options || {});
      return devices;
    },
  });

  const sortedAndFilteredDevices = useMemo(() => {
    let result = data;

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
            aValue = a.name || a.configuration?.name;
            bValue = b.name || b.configuration?.name;
            break;
          // case "mode":
          //   aValue = a.mode;
          //   bValue = b.mode;
          //   break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "automation":
            aValue = a.automation
              ? `${a.automation.minutesOn}/${a.automation.minutesOff}`
              : "";
            bValue = b.automation
              ? `${b.automation.minutesOn}/${b.automation.minutesOff}`
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
  }, [data, searchQuery, sortState, isReversed]);

  return {
    devices: sortedAndFilteredDevices,
    isLoading,
    isError,
    error,
  };
}

import { useQuery } from "@tanstack/react-query";
import { fetchDevices } from "@/lib/device";
export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const records = await fetchDevices();
      return records;
    },
  });
}

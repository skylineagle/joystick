import { fetchInngestEvents } from "@/lib/inngest";
import { useQuery } from "@tanstack/react-query";

export function useTasks() {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => {
      return fetchInngestEvents({
        name: "device/offline.action",
      });
    },
    refetchInterval: 5000,
  });

  return {
    tasks: data?.data,
    timestamp: data?.metadata.fetchedAt,
    isLoading,
  };
}

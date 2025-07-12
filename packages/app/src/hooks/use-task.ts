import { fetchInngestEventRuns } from "@/lib/inngest";
import { useQuery } from "@tanstack/react-query";

export function useTask(eventId: string) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["task", eventId],
    queryFn: () => fetchInngestEventRuns(eventId),
  });

  return {
    task: data?.data,
    isLoading: isLoading || isFetching,
    refetch,
  };
}

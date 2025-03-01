import { fetchModelActions } from "@/lib/device";
import { useQuery } from "@tanstack/react-query";

export function useDeviceActions(modelId?: string) {
  return useQuery({
    queryKey: ["device-actions", modelId],
    queryFn: async () => {
      const actions = await fetchModelActions(modelId);
      return actions;
    },
    enabled: !!modelId,
  });
}

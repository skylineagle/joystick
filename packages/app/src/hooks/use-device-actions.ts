import { pb } from "@/lib/pocketbase";
import { RunResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

interface DeviceAction {
  id: string;
  name: string;
}

export function useDeviceActions(modelId?: string) {
  console.log(modelId);
  return useQuery({
    queryKey: ["device-actions", modelId],
    queryFn: async (): Promise<DeviceAction[]> => {
      if (!modelId) return [];

      try {
        const runResult = await pb.collection("run").getFullList<RunResponse>({
          filter: `model = "${modelId}"`,
          expand: "action",
        });

        if (!runResult.length) return [];

        console.log(runResult);

        const actions = runResult
          .filter((item) => item.expand?.action && item.expand?.action.name)
          .map((item) => {
            const action = item.expand?.action;
            return {
              id: action?.id ?? "",
              name: action?.name ?? "",
            };
          });

        return actions;
      } catch (error) {
        console.error("Failed to fetch device actions:", error);
        return [];
      }
    },
    enabled: !!modelId,
  });
}

import { getDeviceAction } from "@/lib/device";
import { getModeOptionsFromSchema } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export function useAvailableModes(modelIds: string[]) {
  const { data: modes, isLoading } = useQuery({
    queryKey: ["device-action", ...modelIds],
    queryFn: async () => {
      const actions = await Promise.all(
        modelIds.map(async (id) => {
          const actions = await getDeviceAction(id, "set-mode");

          return actions?.[0];
        })
      );

      const allModes = actions
        .map((action) => getModeOptionsFromSchema(action?.parameters ?? {}))
        .flat();

      // Return unique values only
      return [...new Set(allModes)];
    },
    enabled: !!modelIds.length && modelIds.length > 0,
  });

  return { data: modes, isLoading };
}

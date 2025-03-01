import { gethDeviceAction } from "@/lib/device";
import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDevice } from "./use-device";

export function useAction(deviceId: string, action: string) {
  const { data: device } = useDevice(deviceId);
  const { data: run, isLoading } = useQuery({
    queryKey: ["device-action", deviceId, action],
    queryFn: () => gethDeviceAction(deviceId, action),
    enabled: !!device,
  });

  const runActionMutation = useMutation({
    mutationFn: async ({ params }: { params?: Record<string, unknown> }) => {
      return runAction({ deviceId, action, params });
    },
    onMutate: () => {},
    onSuccess: () => {
      toast.success({ message: "Action executed successfully" });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error ? error.message : "Failed to execute action",
      });
    },
  });

  return {
    action: run?.[0],
    runAction: runActionMutation.mutate,
    isRunning: runActionMutation.isPending,
    isLoading,
  };
}

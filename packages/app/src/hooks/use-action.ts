import { useDevice } from "@/hooks/use-device";
import { getDeviceAction } from "@/lib/device";
import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useAction(deviceId: string, action: string) {
  const { data: device } = useDevice(deviceId);
  const {
    data: run,
    isLoading,
    refetch: reRun,
  } = useQuery({
    queryKey: ["device-action", device?.device, action],
    queryFn: () => getDeviceAction(device?.device ?? "", action),
    enabled: !!deviceId && !!action && !!device?.device,
  });

  const runActionMutation = useMutation({
    mutationFn: async ({ params }: { params?: Record<string, unknown> }) => {
      return runAction({ deviceId, action, params });
    },
    onMutate: () => {},
    onSuccess: () => {
      toast.success({
        message: `Sent ${action} to ${device?.name}`,
      });
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
    reRun,
  };
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDeviceActions } from "@/lib/device";
import { runAction } from "@/lib/joystick-api";
import { useDevice } from "./use-device";
import { toast } from "sonner";

export function useActions(deviceId: string) {
  const { data: device } = useDevice(deviceId);

  const { data: actions, isLoading } = useQuery({
    queryKey: ["device-actions", deviceId],
    queryFn: () => fetchDeviceActions(device),
    enabled: !!device,
  });

  const runActionMutation = useMutation({
    mutationFn: ({
      action,
      params,
    }: {
      action: string;
      params?: Record<string, unknown>;
    }) => runAction({ deviceId, action, params }),
    onSuccess: () => {
      toast.success("Action executed successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to execute action"
      );
    },
  });

  return {
    actions,
    isLoading,
    runAction: runActionMutation.mutate,
    isRunning: runActionMutation.isPending,
  };
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDeviceActions } from "@/lib/device";
import { runAction } from "@/lib/joystick-api";
import { useDevice } from "./use-device";
import { toast } from "sonner";
import { useState } from "react";

export function useActions(deviceId: string) {
  const { data: device } = useDevice(deviceId);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

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
    }) => {
      setCurrentAction(action);
      setActionResult(null);
      return runAction({ deviceId, action, params });
    },
    onSuccess: (data) => {
      toast.success("Action executed successfully");
      setActionResult(data);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to execute action"
      );
      setActionResult(null);
    },
  });

  return {
    actions,
    isLoading,
    runAction: runActionMutation.mutate,
    isRunning: runActionMutation.isPending,
    actionResult,
    currentAction,
  };
}

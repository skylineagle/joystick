import { useDevice } from "@/hooks/use-device";
import { useDeviceActions } from "@/hooks/use-device-actions";
import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast as baseToast } from "sonner";

export function useActions(deviceId: string) {
  const toastRef = useRef<string | number>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const { data: device } = useDevice(deviceId);
  const { data: actions, isLoading } = useDeviceActions(
    device?.expand?.device.id
  );

  const runActionMutation = useMutation({
    mutationFn: async ({
      action,
      params,
    }: {
      action: string;
      params?: Record<string, unknown>;
    }) => {
      toastRef.current = toast.loading({
        message: "Executing action...",
      });

      setCurrentAction(action);
      setActionResult(null);
      return runAction({ deviceId, action, params });
    },
    retry: false,
    onSuccess: (data) => {
      if (toastRef.current) baseToast.dismiss(toastRef.current);

      toast.success({
        message: `Successfully sent ${currentAction} to ${device?.name}`,
      });
      setActionResult(data ?? null);
    },
    onError: (error) => {
      if (toastRef.current) baseToast.dismiss(toastRef.current);

      toast.error({
        message:
          error instanceof Error ? error.message : "Failed to execute action",
      });
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

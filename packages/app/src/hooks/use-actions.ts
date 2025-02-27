import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDeviceActions } from "@/lib/device";
import { runAction } from "@/lib/joystick-api";
import { useDevice } from "./use-device";
import { toast as baseToast } from "sonner";
import { toast } from "@/utils/toast";
import { useRef, useState } from "react";

export function useActions(deviceId: string) {
  const { data: device } = useDevice(deviceId);
  const toastRef = useRef<string | number>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const { data: actions, isLoading } = useQuery({
    queryKey: ["device-actions", deviceId],
    queryFn: () => fetchDeviceActions(device),
    enabled: !!device,
  });

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
    onMutate: () => {},
    onSuccess: (data) => {
      if (toastRef.current) baseToast.dismiss(toastRef.current);

      toast.success({ message: "Action executed successfully" });
      setActionResult(data);
    },
    onError: (error) => {
      if (toastRef.current) baseToast.dismiss(toastRef.current);
      console.log(error);

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

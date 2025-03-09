import { useAction } from "@/hooks/use-action";
import { runAction } from "@/lib/joystick-api";
import { DeviceResponse } from "@/types/types";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMode(device: DeviceResponse) {
  const queryClient = useQueryClient();
  const { action, isLoading: isActionLoading } = useAction(
    device?.id,
    "set-mode"
  );
  const mode = device?.mode;
  const { mutate: setMode, isPending: isSetModePending } = useMutation({
    mutationFn: (mode: string) => {
      return runAction({
        deviceId: device.id,
        action: "set-mode",
        params: { mode },
      });
    },
    onError: (error) => {
      toast.error({
        message: error.message,
      });
    },
    onSuccess: () => {
      toast.success({
        message: "Mode set successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["device", device.id] });
    },
  });

  return {
    action,
    mode,
    isAutomated: device?.auto,
    setMode,
    isSetModePending,
    isLoading: isActionLoading,
  };
}

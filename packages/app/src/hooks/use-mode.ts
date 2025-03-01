import { useAction } from "@/hooks/use-action";
import { useDevice } from "@/hooks/use-device";
import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMode(deviceId: string) {
  const queryClient = useQueryClient();
  const { action, isLoading: isActionLoading } = useAction(
    deviceId,
    "set-mode"
  );
  const { data: device } = useDevice(deviceId);
  const mode = device?.mode;
  const { mutate: setMode } = useMutation({
    mutationFn: (mode: string) => {
      // if (!isSupported) {
      //   throw new Error("Device does not support mode setting");
      // }

      return runAction({
        deviceId,
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
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
    },
  });

  return {
    action,
    mode,
    isAutomated: device?.auto,
    setMode,
    isLoading: isActionLoading,
  };
}

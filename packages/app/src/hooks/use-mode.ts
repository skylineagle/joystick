import { useDevice } from "@/hooks/use-device";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMode(deviceId: string) {
  const isSupported = useIsSupported(deviceId, ["set-mode", "get-mode"]);
  const queryClient = useQueryClient();
  const { data: device, isLoading } = useDevice(deviceId);
  const mode = device?.mode;

  const { mutate: setMode } = useMutation({
    mutationFn: (mode: string) => {
      if (!isSupported) {
        throw new Error("Device does not support mode setting");
      }

      return runAction({ deviceId, action: "set-mode", params: { mode } });
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

  return { mode, setMode, isLoading };
}

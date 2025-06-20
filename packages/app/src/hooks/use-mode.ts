import { useAction } from "@/hooks/use-action";
import { useDevice } from "@/hooks/use-device";
import { runAction } from "@/lib/joystick-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMode(deviceId: string) {
  const queryClient = useQueryClient();
  const { data: device } = useDevice(deviceId);
  const { action, isLoading: isActionLoading } = useAction(
    deviceId,
    "set-mode"
  );
  const mode = device?.mode;
  const { mutate: setMode, isPending: isSetModePending } = useMutation({
    mutationFn: (mode: string) => {
      return runAction({
        deviceId,
        action: "set-mode",
        params: { mode },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
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

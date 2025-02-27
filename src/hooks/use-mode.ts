import { runAction } from "@/lib/joystick-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/toast";

export function useMode(deviceId: string) {
  const queryClient = useQueryClient();
  const { data: mode } = useQuery({
    queryKey: ["mode", deviceId],
    queryFn: async () => {
      const data = await runAction({ deviceId, action: "get-mode" });

      return data;
    },
    enabled: !!deviceId,
  });
  const { mutate: setMode } = useMutation({
    mutationFn: (mode: string) =>
      runAction({ deviceId, action: "set-mode", params: { mode } }),
    onError: (error) => {
      toast.error({
        message: error.message,
      });
    },
    onSuccess: () => {
      toast.success({
        message: "Mode set successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["mode", deviceId] });
    },
  });

  return { mode, setMode };
}

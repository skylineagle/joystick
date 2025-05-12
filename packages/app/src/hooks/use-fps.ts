import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFps(deviceId: string) {
  const queryClient = useQueryClient();
  const {
    data: fps,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["fps", deviceId],
    queryFn: async () => {
      const data = await runAction({
        deviceId,
        action: "get-fps",
        log: false,
      });
      return data;
    },
    enabled: !!deviceId,
  });
  const { mutate: setFps } = useMutation({
    mutationFn: (fps: number) =>
      runAction({ deviceId, action: "set-fps", params: { fps } }),
    onError: (error) => {
      console.log(error);
      toast.error({
        message: error.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fps", deviceId] });
    },
  });

  return {
    fps,
    setFps,
    refreshFps: refetch,
    isLoading: isFetching || isLoading,
  };
}

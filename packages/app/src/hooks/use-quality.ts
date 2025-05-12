import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useQuality(deviceId: string) {
  const queryClient = useQueryClient();
  const {
    data: quality,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["quality", deviceId],
    queryFn: async () => {
      const data = await runAction({
        deviceId,
        action: "get-quality",
        log: false,
      });

      const parsedData = JSON.parse(data ?? "{}");

      return parsedData;
    },
    enabled: !!deviceId,
  });

  const { mutate: setQuality } = useMutation({
    mutationFn: (quality: number) =>
      runAction({ deviceId, action: "set-quality", params: { quality } }),
    onError: (error) => {
      console.log(error);
      toast.error({
        message: error.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality", deviceId] });
    },
  });

  return {
    quality,
    setQuality,
    refreshQuality: refetch,
    isLoading: isFetching || isLoading,
  };
}

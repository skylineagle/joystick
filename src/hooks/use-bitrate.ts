import { runAction } from "@/lib/joystick-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useBitrate(deviceId: string) {
  const queryClient = useQueryClient();
  const { data: bitrate } = useQuery({
    queryKey: ["bitrate", deviceId],
    queryFn: async () => {
      const data = await runAction({ deviceId, action: "get-bitrate" });
      return data;
    },
    enabled: !!deviceId,
  });
  const { mutate: setBitrate } = useMutation({
    mutationFn: (bitrate: number) =>
      runAction({ deviceId, action: "set-bitrate", params: { bitrate } }),
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Bitrate set successfully");
      queryClient.invalidateQueries({ queryKey: ["bitrate", deviceId] });
    },
  });

  return { bitrate, setBitrate };
}

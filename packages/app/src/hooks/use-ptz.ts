import { useActionParameters } from "@/hooks/use-action-parameters";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JSONSchema7 } from "json-schema";

type PtzAxis = "x" | "y";

export function usePtz(deviceId: string, axis: PtzAxis) {
  const queryClient = useQueryClient();
  const { isSupported } = useIsSupported(deviceId, [
    `get-${axis}`,
    `set-${axis}`,
  ]);

  const { parameters: setActionParameters } = useActionParameters<JSONSchema7>(
    deviceId,
    `set-${axis}`
  );

  const {
    data: ptzValue,
    refetch,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: [`ptz-${axis}`, deviceId],
    queryFn: async () => {
      const data = await runAction({
        deviceId,
        action: `get-${axis}`,
        log: false,
      });
      return data;
    },
    enabled: !!deviceId && isSupported,
  });

  const { mutate: setPtzValue } = useMutation({
    mutationFn: (value: number) =>
      runAction({
        deviceId,
        action: `set-${axis}`,
        params: { [axis]: value },
      }),
    onError: (error) => {
      console.log(error);
      toast.error({
        message: error.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`ptz-${axis}`, deviceId] });
    },
  });

  return {
    ptzValue,
    setPtzValue,
    min: (setActionParameters?.properties?.pos as JSONSchema7)?.minimum ?? 0,
    max: (setActionParameters?.properties?.pos as JSONSchema7)?.maximum ?? 0,
    refreshPtzValue: refetch,
    isLoading: isFetching || isLoading,
    isSupported,
  };
}

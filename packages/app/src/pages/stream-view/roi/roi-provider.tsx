import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { transformToCommittedRoiProperties } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RoiProvider as BaseRoiProvider,
  CommittedRoiProperties,
} from "react-roi";
export const RoiProvider = ({
  deviceId,
  children,
}: {
  deviceId: string;
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const { isSupported: isRoiSupported } = useIsSupported(deviceId!, [
    "set-roi",
    "get-roi",
  ]);
  const { data } = useQuery({
    queryKey: ["get-roi", deviceId, isRoiSupported],
    queryFn: async () => {
      if (!isRoiSupported) return false;
      try {
        const data = await runAction({
          deviceId: deviceId!,
          action: "get-roi",
        });
        const parsedData = JSON.parse(data ?? "");
        const result = parsedData.map(
          (roi: { x1: number; x2: number; y1: number; y2: number }) =>
            transformToCommittedRoiProperties(roi)
        );

        return result;
      } catch (error) {
        console.error("Failed to parse roi result", error);
        return [];
      }
    },
    enabled: !!deviceId && isRoiSupported,
  });

  const { mutate: setRoi } = useMutation({
    mutationFn: async (roi: Partial<CommittedRoiProperties>) => {
      await runAction({
        deviceId: deviceId!,
        action: "set-roi",
        params: {
          rois: [roi],
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-roi", deviceId] });
    },
  });

  return isRoiSupported ? (
    <BaseRoiProvider
      initialConfig={{
        commitRoiBoxStrategy: "exact",
        resizeStrategy: "none",
        rois: data,
      }}
      onAfterDraw={(roi) => {
        setRoi(roi);
      }}
      onAfterMove={(_selectedRoiId, roi) => {
        setRoi(roi);
      }}
      onAfterResize={(_selectedRoiId, roi) => {
        setRoi(roi);
      }}
      onAfterRotate={(_selectedRoiId, roi) => {
        setRoi(roi);
      }}
    >
      {children}
    </BaseRoiProvider>
  ) : (
    <>{children}</>
  );
};

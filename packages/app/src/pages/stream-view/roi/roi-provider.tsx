import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { transformToCommittedRoiProperties } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  RoiProvider as BaseRoiProvider,
  CommittedRoiProperties,
} from "react-roi";
import { useLocalStorage } from "usehooks-ts";

const DeviceIdContext = React.createContext<string>("");

export const useDeviceId = () => {
  return React.useContext(DeviceIdContext);
};

export const RoiProvider = ({
  deviceId,
  children,
}: {
  deviceId: string;
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const [localRois, setLocalRois] = useLocalStorage<CommittedRoiProperties[]>(
    `rois-${deviceId}`,
    []
  );

  const { isSupported: isRoiSupported } = useIsSupported(deviceId!, [
    "set-roi",
    "get-roi",
  ]);

  const { data } = useQuery({
    queryKey: ["get-roi", deviceId, isRoiSupported],
    queryFn: async () => {
      if (!isRoiSupported) return [];
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

  // Local storage handlers for ROIs
  const handleLocalRoiChange = (roi: Partial<CommittedRoiProperties>) => {
    const updatedRois = [...localRois];
    const existingRoiIndex = updatedRois.findIndex((r) => r.id === roi.id);

    if (existingRoiIndex >= 0) {
      updatedRois[existingRoiIndex] = {
        ...updatedRois[existingRoiIndex],
        ...roi,
      };
    } else if (roi.id) {
      updatedRois.push(roi as CommittedRoiProperties);
    }

    setLocalRois(updatedRois);
  };

  // Use either API or local storage based on support
  const handleRoiChange = (roi: Partial<CommittedRoiProperties>) => {
    if (isRoiSupported) {
      setRoi(roi);
    } else {
      handleLocalRoiChange(roi);
    }
  };

  return (
    <DeviceIdContext.Provider value={deviceId}>
      <BaseRoiProvider
        initialConfig={{
          commitRoiBoxStrategy: "exact",
          resizeStrategy: "none",
          rois: isRoiSupported ? data || [] : localRois,
        }}
        onAfterDraw={(roi) => {
          handleRoiChange(roi);
        }}
        onAfterMove={(_selectedRoiId, roi) => {
          handleRoiChange(roi);
        }}
        onAfterResize={(_selectedRoiId, roi) => {
          handleRoiChange(roi);
        }}
        onAfterRotate={(_selectedRoiId, roi) => {
          handleRoiChange(roi);
        }}
      >
        {children}
      </BaseRoiProvider>
    </DeviceIdContext.Provider>
  );
};

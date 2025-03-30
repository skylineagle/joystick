import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { transformToCommittedRoiProperties } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  RoiProvider as BaseRoiProvider,
  CommittedRoiProperties,
} from "react-roi";

// Context for providing deviceId to nested components
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
  const [localRois, setLocalRois] = useState<CommittedRoiProperties[]>([]);
  const [isLocalRoisLoaded, setIsLocalRoisLoaded] = useState(false);
  const { isSupported: isRoiSupported } = useIsSupported(deviceId!, [
    "set-roi",
    "get-roi",
  ]);

  // Load ROIs from local storage when component mounts
  useEffect(() => {
    if (!isRoiSupported && deviceId) {
      try {
        const storedRois = localStorage.getItem(`rois-${deviceId}`);
        if (storedRois) {
          const parsedRois = JSON.parse(storedRois);
          setLocalRois(Array.isArray(parsedRois) ? parsedRois : []);
        }
      } catch (error) {
        console.error("Failed to parse stored ROIs", error);
      } finally {
        setIsLocalRoisLoaded(true);
      }
    } else {
      setIsLocalRoisLoaded(true);
    }
  }, [deviceId, isRoiSupported]);

  const { data, isLoading: isApiRoisLoading } = useQuery({
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
    localStorage.setItem(`rois-${deviceId}`, JSON.stringify(updatedRois));
  };

  // Use either API or local storage based on support
  const handleRoiChange = (roi: Partial<CommittedRoiProperties>) => {
    if (isRoiSupported) {
      setRoi(roi);
    } else {
      handleLocalRoiChange(roi);
    }
  };

  // Determine if we're ready to render
  const isLoading = isRoiSupported ? isApiRoisLoading : !isLocalRoisLoaded;
  const rois = isRoiSupported ? data || [] : localRois;

  // Don't render the provider until data is loaded
  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <DeviceIdContext.Provider value={deviceId}>
      <BaseRoiProvider
        initialConfig={{
          commitRoiBoxStrategy: "exact",
          resizeStrategy: "none",
          rois,
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

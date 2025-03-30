import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDevice } from "@/hooks/use-device";
import { runAction } from "@/lib/joystick-api";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crosshair, RefreshCw } from "lucide-react";
import { lazy, Suspense } from "react";
import { z } from "zod";

const BoxScene = lazy(() => import("@/components/3d/box-scene"));

const imuSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// Custom hook to fetch IMU data using React Query
const useGetIMUData = (deviceId: string) => {
  const { data: device } = useDevice(deviceId);

  return useQuery({
    queryKey: ["imu-data", deviceId],
    queryFn: async () => {
      const response = await runAction({
        deviceId,
        action: "get-imu",
      });

      // Parse response if it's a string
      const parsedResponse =
        typeof response === "string" ? JSON.parse(response) : response;

      // Validate against schema
      try {
        const validatedData = imuSchema.parse(parsedResponse);

        // Apply reset values if they exist
        if (device?.information?.imuResetValues) {
          return {
            x: validatedData.x - device.information.imuResetValues.x,
            y: validatedData.y - device.information.imuResetValues.y,
            z: validatedData.z - device.information.imuResetValues.z,
          };
        }

        return validatedData;
      } catch (error) {
        throw new Error(
          `Failed to fetch IMU data: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
    refetchInterval: 20000, // Refetch data every 20 seconds
  });
};

export const IMUStatus = ({ deviceId }: { deviceId: string }) => {
  const queryClient = useQueryClient();
  const {
    data: imuData = { x: 0, y: 0, z: 0 },
    isLoading,
    isRefetching,
    refetch,
  } = useGetIMUData(deviceId);

  const resetIMUMutation = useMutation({
    mutationFn: async () => {
      // Save current IMU values as reset values in device information
      await pb.collection("devices").update(deviceId, {
        information: {
          imuResetValues: {
            x: imuData.x,
            y: imuData.y,
            z: imuData.z,
          },
        },
      });
    },
    onSuccess: () => {
      toast.success({
        message: "IMU reset values saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error
            ? error.message
            : "Failed to save IMU reset values",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">IMU Data</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => resetIMUMutation.mutate()}
            disabled={isLoading || resetIMUMutation.isPending}
          >
            <Crosshair className="h-4 w-4" />
            <span className="sr-only">Reset IMU</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                isLoading && "animate-spin",
                isRefetching && "animate-spin"
              )}
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      {/* <Tabs defaultValue="3d" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="3d">3D Visualization</TabsTrigger>
          <TabsTrigger value="classic">Classic View</TabsTrigger>
        </TabsList>

        <TabsContent value="3d" className="mt-0">
          <Card className="p-4 relative aspect-square">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Loading 3D model...
                </div>
              }
            >
              <MangoScene imuData={imuData} />
            </Suspense>
            <div className="absolute top-2 right-2 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground">
              Mango rotates based on IMU data
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="classic" className="mt-0">
          <Card className="p-4 relative aspect-square">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Loading 3D model...
                </div>
              }
            >
              <BoxScene imuData={imuData} />
            </Suspense>
          </Card>
        </TabsContent>
      </Tabs> */}

      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Loading 3D model...
          </div>
        }
      >
        <BoxScene imuData={imuData} />
      </Suspense>

      {/* Numeric display */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col">
          <Label className="text-xs text-muted-foreground">X-Axis</Label>
          <span className="text-sm font-mono">{imuData.x.toFixed(3)}</span>
        </div>
        <div className="flex flex-col">
          <Label className="text-xs text-muted-foreground">Y-Axis</Label>
          <span className="text-sm font-mono">{imuData.y.toFixed(3)}</span>
        </div>
        <div className="flex flex-col">
          <Label className="text-xs text-muted-foreground">Z-Axis</Label>
          <span className="text-sm font-mono">{imuData.z.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
};

import { runAction } from "@/lib/joystick-api";
import { useDevice } from "@/hooks/use-device";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const imuSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type IMUData = z.infer<typeof imuSchema>;

export function useIMUStatus(deviceId: string) {
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
}

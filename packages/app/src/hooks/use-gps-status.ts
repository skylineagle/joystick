import { runAction } from "@/lib/joystick-api";
import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

const gpsSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().optional(),
  accuracy: z.number().optional(),
  timestamp: z.number().optional(),
});

export type GPSData = z.infer<typeof gpsSchema>;

export function useGPSStatus(deviceIds: string[]) {
  return useQueries({
    queries: deviceIds.map((deviceId) => ({
      queryKey: ["gps-data", deviceId],
      queryFn: async () => {
        const response = await runAction({
          deviceId,
          action: "get-gps",
        });

        // Parse response if it's a string
        const parsedResponse =
          typeof response === "string" ? JSON.parse(response) : response;

        // Validate against schema
        try {
          const validatedData = gpsSchema.parse(parsedResponse);
          return { deviceId, ...validatedData };
        } catch (error) {
          throw new Error(
            `Failed to fetch GPS data: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      },
      refetchInterval: 15000,
    })),
  });
}

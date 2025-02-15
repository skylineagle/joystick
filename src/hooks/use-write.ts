import { useMutation } from "@tanstack/react-query";
import { writeParams, readParams } from "@/lib/joystick-api";
import { toast } from "sonner";
import { ParamPath } from "@/types/params";

export function useParamsActions(deviceId: string) {
  const readMutation = useMutation({
    mutationFn: (path: ParamPath) => readParams({ deviceId, path }),
    onSuccess: () => {
      toast.success("Parameter read successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to read parameter"
      );
    },
  });

  const writeMutation = useMutation({
    mutationFn: ({ path, value }: { path: ParamPath; value: unknown }) =>
      writeParams({ deviceId, path, value }),
    onSuccess: (_, variables) => {
      toast.success("Parameter written successfully");
      // Auto-read after successful write
      readMutation.mutate(variables.path);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to write parameter"
      );
    },
  });

  return { writeMutation, readMutation };
}

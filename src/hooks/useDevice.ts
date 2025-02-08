import { fetchDeviceStatus, sendDeviceCommand } from "@/services/device";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query key factory to maintain consistency
const deviceKeys = {
  all: ["device"] as const,
  status: () => [...deviceKeys.all, "status"] as const,
  commands: () => [...deviceKeys.all, "commands"] as const,
};

export function useDeviceStatus() {
  return useQuery({
    queryKey: deviceKeys.status(),
    queryFn: fetchDeviceStatus,
    // Polling every 5 seconds - adjust as needed
    refetchInterval: 5000,
    // Don't pause polling when window loses focus
    refetchIntervalInBackground: true,
    // Show stale data while refetching
    staleTime: 1000,
    // Retry 3 times before showing error
    retry: 3,
  });
}

export function useDeviceCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendDeviceCommand,
    // Optionally invalidate the status query after successful command
    onSuccess: () => {
      // You might want to refetch the status after a command
      queryClient.invalidateQueries({ queryKey: deviceKeys.status() });
    },
    // Handle errors gracefully
    onError: (error) => {
      console.error("Device command failed:", error);
      // You could trigger a toast notification here
    },
  });
}

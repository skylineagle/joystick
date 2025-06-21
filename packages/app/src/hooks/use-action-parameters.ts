import { useAction } from "@/hooks/use-action";

export function useActionParameters<T>(deviceId: string, action: string) {
  const { action: actionData, isLoading } = useAction(deviceId, action);

  return {
    parameters: actionData?.parameters as T,
    isLoading,
  };
}

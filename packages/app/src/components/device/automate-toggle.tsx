import { Switch } from "@/components/ui/switch";
import { updateDevice } from "@/lib/device";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { toast } from "@/utils/toast";

interface AutomateToggleProps {
  deviceId: string;
  isAutomated: boolean;
}

export const AutomateToggle = memo(
  ({ deviceId, isAutomated }: AutomateToggleProps) => {
    const queryClient = useQueryClient();

    const { mutate: toggleAutomation, isPending } = useMutation({
      mutationFn: async (enabled: boolean) => {
        await updateDevice({
          id: deviceId,
          auto: enabled,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
        queryClient.invalidateQueries({ queryKey: ["devices"] });
        toast.success({ message: "Automation setting updated" });
      },
      onError: (error) => {
        toast.error({
          message: `Failed to update automation: ${error.message}`,
        });
      },
    });

    return (
      <div className="size-full flex flex-row items-center gap-2">
        <Switch
          checked={isAutomated}
          onCheckedChange={(checked) => toggleAutomation(checked)}
          disabled={isPending}
          id={`automate-toggle-${deviceId}`}
          aria-label="Toggle automation"
        />
      </div>
    );
  }
);

AutomateToggle.displayName = "AutomateToggle";

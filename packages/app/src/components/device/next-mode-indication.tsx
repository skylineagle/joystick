import { Label } from "@/components/ui/label";
import { useModeConfig } from "@/hooks/use-model-configs";
import { cn } from "@/lib/utils";
import { DeviceAutomation } from "@/types/types";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

interface NextModeIndicationProps {
  deviceId: string;
  next: DeviceAutomation["off"] | DeviceAutomation["on"];
}

export const NextModeIndication = ({
  deviceId,
  next,
}: NextModeIndicationProps) => {
  const { data: config } = useModeConfig(deviceId);
  const { label, color, icon: Icon } = config[next.mode as keyof typeof config];

  return (
    <div className={cn("flex flex-row items-center cursor-pointer")}>
      <DynamicIcon
        name={Icon as IconName}
        className={cn("h-4 w-4 mr-2", color)}
      />
      <Label className={cn("font-medium transition-colors", color)}>
        {label}
      </Label>
    </div>
  );
};

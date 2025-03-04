import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getDefaultModeConfig, modeConfig } from "@/components/device/consts";
import { DeviceAutomation } from "@/types/types";

interface NextModeIndicationProps {
  next: DeviceAutomation["off"] | DeviceAutomation["on"];
}

export const NextModeIndication = ({ next }: NextModeIndicationProps) => {
  const {
    label,
    color,
    icon: Icon,
  } = modeConfig[next.mode as keyof typeof modeConfig] ||
  getDefaultModeConfig(next.mode);

  return (
    <div className={cn("flex flex-row items-center cursor-pointer")}>
      <Icon className={cn("h-4 w-4 mr-2", color)} />
      <Label className={cn("font-medium transition-colors", color)}>
        {label}
      </Label>
    </div>
  );
};

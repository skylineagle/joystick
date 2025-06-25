import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDevice } from "@/hooks/use-device";
import { Zap } from "lucide-react";

interface SlotHealthIndicatorProps {
  deviceId: string;
}

export const SlotHealthIndicator = ({ deviceId }: SlotHealthIndicatorProps) => {
  const { data: device } = useDevice(deviceId);

  const hasAutoSlotSwitch = device?.information?.autoSlotSwitch;
  const hasSecondSlot = device?.information?.secondSlotHost;

  if (!hasAutoSlotSwitch || !hasSecondSlot) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="h-8 px-2 flex items-center gap-1">
          <Zap className="h-3 w-3 text-blue-500" />
          <span className="text-xs">Auto</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">Auto Slot Switching Enabled</p>
      </TooltipContent>
    </Tooltip>
  );
};

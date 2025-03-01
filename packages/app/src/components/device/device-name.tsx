import { StreamLink } from "@/components/device/stream-link";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@radix-ui/react-label";
import { memo } from "react";

export interface DeviceNameProps {
  name?: string;
  configurationName: string;
}

export const DeviceName = memo(
  ({ configurationName, name }: DeviceNameProps) => {
    return (
      <div className="flex items-center gap-2">
        {name ? (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="default" className="text-md">
                <Label>{name}</Label>
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={30}>
              {configurationName}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Badge variant="default">
            <Label>{configurationName}</Label>
          </Badge>
        )}

        <StreamLink name={configurationName} />
      </div>
    );
  }
);

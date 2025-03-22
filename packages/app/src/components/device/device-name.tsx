import { StreamLink } from "@/components/device/stream-link";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import { runAction } from "@/lib/joystick-api";
import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { memo } from "react";

export interface DeviceNameProps {
  deviceId: string;
  name?: string;
  configurationName: string;
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const DeviceName = memo(
  ({ deviceId, configurationName, name }: DeviceNameProps) => {
    const isAllowedToViewStream = useIsPermitted("view-stream");
    const { isSupported: isHealthcheckSupported } = useIsSupported(
      deviceId ?? "",
      "healthcheck"
    );

    const { data: isConnected, isLoading: isHealthcheckLoading } = useQuery({
      queryKey: ["healthcheck-indicator", deviceId, isHealthcheckSupported],
      queryFn: async () => {
        if (!isHealthcheckSupported) return false;
        const data = await runAction({
          deviceId: deviceId!,
          action: "healthcheck",
          params: {},
        });
        return data === "true";
      },
      enabled: !!deviceId && isHealthcheckSupported,
      // refetchInterval: 15000,
    });

    const getBadgeVariant = (): BadgeVariant => {
      if (!isHealthcheckSupported) return "secondary";

      if (isHealthcheckLoading) {
        return "loading";
      }

      if (isConnected) {
        return "default";
      }

      return "disconnected";
    };

    return (
      <div className="flex items-center gap-2">
        {name ? (
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant={getBadgeVariant()}
                className="text-md transition-all duration-300"
              >
                <Label>{name}</Label>
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={30}>
              {configurationName}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Badge
            variant={getBadgeVariant()}
            className="transition-all duration-300"
          >
            <Label>{configurationName}</Label>
          </Badge>
        )}

        {isAllowedToViewStream && <StreamLink name={configurationName} />}
      </div>
    );
  }
);

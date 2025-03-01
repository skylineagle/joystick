import { getDefaultModeConfig, modeConfig } from "@/components/device/consts";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/use-action";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMode } from "@/hooks/use-mode";
import { cn, getModeOptionsFromSchema } from "@/lib/utils";
import { motion } from "motion/react";
import { memo, useMemo } from "react";

export interface ModeSelectorProps {
  automation: boolean;
  deviceId: string;
}

export const ModeSelector = memo(
  ({ automation, deviceId }: ModeSelectorProps) => {
    const { mode, setMode, isLoading } = useMode(deviceId);
    const { action, isLoading: isActionLoading } = useAction(
      deviceId,
      "set-mode"
    );
    const isSupported = useIsSupported(deviceId, ["set-mode", "get-mode"]);
    const isPermitted = useIsPermitted("set-mode");

    const availableModes = useMemo(() => {
      return getModeOptionsFromSchema(action?.parameters ?? {});
    }, [action]);

    const currentMode = Object.keys(modeConfig).includes(mode ?? "")
      ? modeConfig[mode as keyof typeof modeConfig]
      : getDefaultModeConfig(mode ?? "");

    if (isLoading || isActionLoading || !isSupported) {
      return (
        <Select disabled value={mode}>
          <SelectTrigger className="w-40 opacity-70">
            <Skeleton className="h-4 w-4" />
          </SelectTrigger>
        </Select>
      );
    }

    return (
      availableModes.length !== 0 && (
        <Select
          value={mode}
          onValueChange={(value) => setMode(value)}
          disabled={isLoading || !isPermitted}
        >
          <SelectTrigger
            className={cn(
              "w-40 transition-all duration-300 ease-in-out border-1",
              currentMode.bgColor,
              "border-transparent",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Select camera mode"
          >
            <motion.div
              className="flex items-center gap-2"
              initial={false}
              animate={{ scale: isLoading ? 0.95 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={false}
                animate={{
                  rotate: mode === "auto" ? 360 : 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <currentMode.icon
                  className={cn("h-4 w-4", currentMode.color)}
                />
              </motion.div>
              <span className="truncate">{currentMode.label}</span>
            </motion.div>
          </SelectTrigger>

          <SelectContent className="w-44 border-none bg-popover/95 backdrop-blur-sm shadow-xl">
            {availableModes.map((actionName) => {
              const config =
                modeConfig[actionName as keyof typeof modeConfig] ||
                getDefaultModeConfig(actionName);

              const { label, color, bgColor, hoverColor, icon: Icon } = config;
              const isDisabled = actionName === "auto" && !automation;
              const isSelected = mode === actionName;

              return (
                <SelectItem
                  key={actionName}
                  value={actionName}
                  disabled={isDisabled}
                  className={cn(
                    "transition-all duration-200 rounded-md",
                    isSelected && bgColor,
                    !isSelected && hoverColor,
                    isDisabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className="flex flex-row items-center cursor-pointer my-0.5 px-2 py-1.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 mr-2",
                        isSelected ? color : "text-muted-foreground",
                        !isSelected &&
                          actionName === "offline" &&
                          "group-hover:text-slate-500",
                        !isSelected &&
                          actionName === "auto" &&
                          "group-hover:text-blue-500",
                        !isSelected &&
                          actionName === "live" &&
                          "group-hover:text-green-500",
                        !isSelected &&
                          actionName !== "offline" &&
                          actionName !== "auto" &&
                          actionName !== "live" &&
                          "group-hover:text-purple-500"
                      )}
                    />
                    <Label
                      className={cn(
                        "font-medium transition-colors",
                        isSelected && color,
                        !isSelected && "group-hover:text-purple-500",
                        actionName === "offline" &&
                          "group-hover:text-slate-500",
                        actionName === "auto" && "group-hover:text-blue-500",
                        actionName === "live" && "group-hover:text-green-500"
                      )}
                    >
                      {label}
                    </Label>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )
    );
  }
);

ModeSelector.displayName = "ModeSelector";

import { getDefaultModeConfig, modeConfig } from "@/components/device/consts";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useMode } from "@/hooks/use-mode";
import { cn, getModeOptionsFromSchema } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { memo, useCallback } from "react";

export interface ModeSelectorProps {
  deviceId: string;
}

export const ModeSelector = memo(({ deviceId }: ModeSelectorProps) => {
  const { action, mode, setMode, isAutomated, isLoading } = useMode(deviceId);
  const availableModes = getModeOptionsFromSchema(action?.parameters ?? {});
  const currentMode = Object.keys(modeConfig).includes(mode ?? "")
    ? modeConfig[mode as keyof typeof modeConfig]
    : getDefaultModeConfig(mode ?? "");

  const handleModeChange = useCallback(
    (value: string) => {
      setMode(value);
    },
    [setMode]
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {availableModes.length !== 0 && (
        <Select
          value={mode}
          onValueChange={handleModeChange}
          disabled={isLoading || isAutomated}
        >
          <SelectTrigger
            className={cn(
              "w-40 transition-all duration-300 ease-in-out border-1",
              currentMode.bgColor,
              "border-transparent",
              (isLoading || isAutomated) && "opacity-50 cursor-not-allowed"
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
              const {
                label,
                color,
                bgColor,
                hoverColor,
                icon: Icon,
              } = modeConfig[actionName as keyof typeof modeConfig] ||
              getDefaultModeConfig(actionName);

              const isSelected = mode === actionName;
              console.log(actionName);
              console.log(modeConfig[actionName as keyof typeof modeConfig]);

              return (
                <SelectItem
                  key={actionName}
                  value={actionName}
                  className={cn(
                    "transition-all duration-200 rounded-md",
                    isSelected && bgColor,
                    !isSelected && hoverColor
                  )}
                >
                  <div
                    className={
                      "flex flex-row items-center cursor-pointer my-0.5 px-2 py-1.5"
                    }
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 mr-2",
                        isSelected ? color : "text-muted-foreground"
                      )}
                    />
                    <Label
                      className={cn(
                        "font-medium transition-colors",
                        isSelected && color
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
      )}
    </div>
  );
});

ModeSelector.displayName = "ModeSelector";

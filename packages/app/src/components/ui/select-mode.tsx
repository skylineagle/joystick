import { getDefaultModeConfig, modeConfig } from "@/components/device/consts";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface SelectModeProps {
  mode: string;
  handleModeChange: (value: string) => void;
  isLoading: boolean;
  availableModes: string[];
}

export const SelectMode = ({
  mode,
  handleModeChange,
  isLoading,
  availableModes,
}: SelectModeProps) => {
  const currentMode = Object.keys(modeConfig).includes(mode ?? "")
    ? modeConfig[mode as keyof typeof modeConfig]
    : getDefaultModeConfig(mode ?? "");

  return (
    <Select value={mode} onValueChange={handleModeChange} disabled={isLoading}>
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
            <currentMode.icon className={cn("h-4 w-4", currentMode.color)} />
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

          const isSelected = mode === actionName;

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
                    actionName === "offline" && "group-hover:text-slate-500",
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
  );
};

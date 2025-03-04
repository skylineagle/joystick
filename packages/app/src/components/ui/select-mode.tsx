import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useModeConfig } from "@/hooks/use-model-configs";
import { cn } from "@/lib/utils";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { motion } from "motion/react";

export interface SelectModeProps {
  deviceId: string;
  mode: string;
  handleModeChange: (value: string) => void;
  isLoading: boolean;
  availableModes: string[];
}

export const SelectMode = ({
  deviceId,
  mode,
  handleModeChange,
  isLoading,
  availableModes,
}: SelectModeProps) => {
  const { data: configs } = useModeConfig(deviceId);
  const config = configs?.[mode as keyof typeof configs] ?? {};

  return (
    <Select value={mode} onValueChange={handleModeChange} disabled={isLoading}>
      <SelectTrigger
        className={cn(
          "w-40 transition-all duration-300 ease-in-out border-1",
          config.bgColor,
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
            <DynamicIcon
              name={config.icon as IconName}
              className={cn("h-4 w-4", config.color)}
            />
          </motion.div>
          <span className="truncate">{config.label}</span>
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
          } = configs?.[actionName as keyof typeof configs] ?? {};

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
                <DynamicIcon
                  name={Icon as IconName}
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

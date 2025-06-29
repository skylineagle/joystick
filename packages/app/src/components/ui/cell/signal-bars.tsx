import { cn } from "@/lib/utils";
import { getSignalBars, getSignalColor, SignalMetricType } from "@/utils/cell";

interface SignalBarsProps {
  value: number;
  technology?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: SignalMetricType;
}

export function SignalBars({
  value,
  technology,
  className,
  size = "md",
  type = "rsrp",
}: SignalBarsProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          width: "w-0.5",
          heights: ["h-1", "h-1.5", "h-2", "h-2.5"],
        };
      case "lg":
        return {
          width: "w-2",
          heights: ["h-3", "h-4", "h-5", "h-6"],
        };
      default:
        return {
          width: "w-1",
          heights: ["h-2", "h-3", "h-4", "h-5"],
        };
    }
  };

  const bars = getSignalBars(value, type, technology);
  const signalColor = getSignalColor(value, type, technology);
  const { width, heights } = getSizeClasses();

  return (
    <div className={cn("flex gap-1 items-end", className)}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={cn(
            width,
            heights[i],
            "rounded-sm transition-colors",
            i < bars ? signalColor : "bg-gray-200 dark:bg-gray-700"
          )}
        />
      ))}
    </div>
  );
}

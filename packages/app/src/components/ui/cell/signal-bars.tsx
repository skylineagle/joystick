import { cn } from "@/lib/utils";

interface SignalBarsProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SignalBars({ value, className, size = "md" }: SignalBarsProps) {
  const getBars = (signalValue: number) => {
    if (signalValue >= -80) return 4;
    if (signalValue >= -90) return 3;
    if (signalValue >= -100) return 2;
    if (signalValue >= -110) return 1;
    return 0;
  };

  const getSignalColor = (signalValue: number) => {
    if (signalValue >= -80) return "bg-green-500";
    if (signalValue >= -90) return "bg-yellow-500";
    if (signalValue >= -100) return "bg-orange-500";
    return "bg-red-500";
  };

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

  const bars = getBars(value);
  const signalColor = getSignalColor(value);
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

import { cn } from "@/lib/utils";

export const AnimatedBattery = ({ percentage = 0 }: { percentage: number }) => {
  const getBatteryColor = (level: number) => {
    if (level >= 50) return "bg-chart-2";
    if (level >= 20) return "bg-chart-4";
    return "bg-destructive";
  };

  return (
    <div className="relative w-16 h-8 border-2 border-muted-foreground rounded-md overflow-hidden">
      {/* Battery nub */}
      <div className="absolute right-[-4px] top-[25%] h-[50%] w-2 bg-muted-foreground rounded-r-sm" />

      {/* Battery fill - animated */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-full transition-all duration-1000 ease-out",
          getBatteryColor(percentage)
        )}
        style={{ width: `${Math.max(1, percentage)}%` }}
      />
    </div>
  );
};

import { cn } from "@/lib/utils";
import { SignalBars } from "./signal-bars";

interface SignalStrengthDisplayProps {
  rsrp: number;
  showValue?: boolean;
  showQuality?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
}

export function SignalStrengthDisplay({
  rsrp,
  showValue = true,
  showQuality = true,
  className,
  size = "md",
  layout = "horizontal",
}: SignalStrengthDisplayProps) {
  const getSignalQuality = (value: number) => {
    if (value >= -80)
      return {
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    if (value >= -90)
      return { label: "Good", color: "text-yellow-600 dark:text-yellow-400" };
    if (value >= -100)
      return { label: "Fair", color: "text-orange-600 dark:text-orange-400" };
    return { label: "Poor", color: "text-red-600 dark:text-red-400" };
  };

  const quality = getSignalQuality(rsrp);

  if (layout === "vertical") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <SignalBars value={rsrp} size={size} />
        {showValue && (
          <div className="text-center">
            <div className={cn("font-mono text-sm font-medium", quality.color)}>
              {rsrp} dBm
            </div>
            {showQuality && (
              <div className={cn("text-xs capitalize", quality.color)}>
                {quality.label}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SignalBars value={rsrp} size={size} />
      {showValue && (
        <div className="text-right">
          <div className={cn("font-mono text-sm font-medium", quality.color)}>
            {rsrp} dBm
          </div>
          {showQuality && (
            <div className={cn("text-xs capitalize", quality.color)}>
              {quality.label}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

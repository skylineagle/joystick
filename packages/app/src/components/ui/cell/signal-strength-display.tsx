import { cn } from "@/lib/utils";
import { SignalBars } from "./signal-bars";
import { getSignalQuality } from "@/utils/cell";

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
  const quality = getSignalQuality(rsrp, "rsrp");

  if (layout === "vertical") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <SignalBars value={rsrp} size={size} type="rsrp" />
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
      <SignalBars value={rsrp} size={size} type="rsrp" />
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
